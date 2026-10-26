/**
 * The contract each workspace module's data layer implements. Components only talk to this, so
 * the local-storage implementations can later be swapped for HTTP ones without touching lists,
 * forms or the overview. Methods are async for that reason; the local versions resolve at once.
 *
 * Failures reject with WorkspaceStorageError (see storage.ts).
 */
export type Repository<Item, CreateInput, UpdateInput = CreateInput> = {
  list(): Promise<Item[]>;
  create(input: CreateInput): Promise<Item>;
  update(id: string, changes: UpdateInput): Promise<Item>;
  remove(id: string): Promise<void>;
  /** Local storage only: delete unreadable data after the user confirmed. */
  resetStorage?(): Promise<void>;
  /** Notifies about changes made elsewhere (another tab today, a server push later). */
  subscribe?(onChange: () => void): () => void;
};
