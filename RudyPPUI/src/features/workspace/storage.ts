import type { Session } from '../auth/types.ts';
import { readJson, removeKey, writeJson } from '../../lib/browserStorage.ts';

/*
 * Browser-local storage for workspace modules (notes, bookmarks, to-dos, sidebar preference).
 *
 * Keys: rudyppui:workspace:v1:<namespace>:<collection>
 *   namespace = "id-<user id from the token's jti>", or "user-<user name>" if a token had no id.
 * The namespace keeps one account's data out of another account's screens in the same browser.
 * It is NOT privacy: anyone using this browser profile can read localStorage.
 *
 * Collections are stored as { schemaVersion, items }. Anything else counts as corrupt and is
 * left untouched until the user explicitly resets that collection.
 */

export const SCHEMA_VERSION = 1;
const PREFIX = 'rudyppui:workspace:v1';

/** Why a workspace operation failed. 'invalid' means the input broke a module rule. */
export type StorageFailure = 'corrupt' | 'unavailable' | 'quota' | 'notFound' | 'invalid';

export class WorkspaceStorageError extends Error {
  readonly reason: StorageFailure;

  constructor(reason: StorageFailure) {
    super(`Workspace storage: ${reason}`);
    this.name = 'WorkspaceStorageError';
    this.reason = reason;
  }
}

export function failureOf(error: unknown): StorageFailure {
  return error instanceof WorkspaceStorageError ? error.reason : 'unavailable';
}

export function workspaceNamespace(session: Pick<Session, 'userId' | 'username'>): string {
  return session.userId
    ? `id-${encodeURIComponent(session.userId)}`
    : `user-${encodeURIComponent(session.username)}`;
}

export function workspaceKey(namespace: string, name: string): string {
  return `${PREFIX}:${namespace}:${name}`;
}

type Container = { schemaVersion: number; items: unknown[] };

function isContainer(value: unknown): value is Container {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Container).schemaVersion === SCHEMA_VERSION &&
    Array.isArray((value as Container).items)
  );
}

/**
 * One stored list of records, e.g. a user's notes. Shared plumbing only: each module passes its
 * own record check and keeps its own field rules.
 */
export function createLocalCollection<T extends { id: string }>(
  namespace: string,
  name: string,
  isItem: (value: unknown) => value is T,
) {
  const key = workspaceKey(namespace, name);

  /** The stored records. Throws WorkspaceStorageError('corrupt' | 'unavailable'). */
  function load(): T[] {
    const result = readJson(key);
    if (result.kind === 'empty') return [];
    if (result.kind === 'unavailable') throw new WorkspaceStorageError('unavailable');
    if (result.kind === 'invalid' || !isContainer(result.value)) {
      throw new WorkspaceStorageError('corrupt');
    }
    const items = result.value.items;
    if (!items.every(isItem)) throw new WorkspaceStorageError('corrupt');
    return items;
  }

  /**
   * Read-modify-write. Re-reading first keeps changes another tab made to other records;
   * only two tabs saving the same record conflict, and then the later save wins.
   */
  function mutate(change: (items: T[]) => T[]): T[] {
    const next = change(load());
    const written = writeJson(key, { schemaVersion: SCHEMA_VERSION, items: next });
    if (!written.ok) throw new WorkspaceStorageError(written.reason);
    return next;
  }

  /** Deletes the stored list. Only called after the user confirmed a reset. */
  function reset(): void {
    const removed = removeKey(key);
    if (!removed.ok) throw new WorkspaceStorageError(removed.reason);
  }

  /** Calls onChange when another tab changes this list (the storage event never fires in the tab that wrote). */
  function subscribe(onChange: () => void): () => void {
    const listener = (event: StorageEvent) => {
      if (event.key === key || event.key === null) onChange();
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }

  return { key, load, mutate, reset, subscribe };
}
