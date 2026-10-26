import { useCallback, useEffect, useState } from 'react';
import type { Repository } from './repository.ts';
import { failureOf, type StorageFailure } from './storage.ts';

export type OperationResult<T> = { ok: true; value: T } | { ok: false; failure: StorageFailure };

type LoadState<Item> =
  | { status: 'loading' }
  | { status: 'ready'; items: Item[] }
  | { status: 'failed'; failure: StorageFailure };

/**
 * List state for one repository: load once, reload after every change, and follow changes made
 * in other tabs. Operations return a result instead of throwing, so forms can keep their input
 * and show the reason. Pass a new repository (e.g. for another account) to start over.
 */
export function useCollection<Item, CreateInput, UpdateInput>(
  repository: Repository<Item, CreateInput, UpdateInput>,
) {
  const [state, setState] = useState<LoadState<Item>>({ status: 'loading' });
  // Bumped when another tab changed the data, so pages can say so
  const [externalChanges, setExternalChanges] = useState(0);

  const reload = useCallback(
    () =>
      repository.list().then(
        (items) => setState({ status: 'ready', items }),
        (error: unknown) => setState({ status: 'failed', failure: failureOf(error) }),
      ),
    [repository],
  );

  useEffect(() => {
    let active = true;
    const load = () =>
      repository.list().then(
        (items) => active && setState({ status: 'ready', items }),
        (error: unknown) => active && setState({ status: 'failed', failure: failureOf(error) }),
      );
    load();
    const unsubscribe = repository.subscribe?.(() => {
      if (!active) return;
      setExternalChanges((count) => count + 1);
      load();
    });
    return () => {
      // Results for a previous repository (e.g. the account that just signed out) are ignored
      active = false;
      unsubscribe?.();
    };
  }, [repository]);

  const run = useCallback(
    async <T>(operation: () => Promise<T>): Promise<OperationResult<T>> => {
      try {
        const value = await operation();
        await reload();
        return { ok: true, value };
      } catch (error) {
        return { ok: false, failure: failureOf(error) };
      }
    },
    [reload],
  );

  return {
    status: state.status,
    items: state.status === 'ready' ? state.items : [],
    loadFailure: state.status === 'failed' ? state.failure : null,
    externalChanges,
    create: (input: CreateInput) => run(() => repository.create(input)),
    update: (id: string, changes: UpdateInput) => run(() => repository.update(id, changes)),
    remove: (id: string) => run(() => repository.remove(id)),
    reset: repository.resetStorage
      ? () => run(() => repository.resetStorage?.() ?? Promise.resolve())
      : undefined,
  };
}

export type CollectionState<Item, CreateInput, UpdateInput> = ReturnType<
  typeof useCollection<Item, CreateInput, UpdateInput>
>;
