import { useMemo } from 'react';
import { newId } from '../../lib/id.ts';
import { charCount } from '../../lib/text.ts';
import type { Repository } from '../workspace/repository.ts';
import { createLocalCollection, WorkspaceStorageError } from '../workspace/storage.ts';
import { useCollection } from '../workspace/useCollection.ts';
import { useWorkspaceNamespace } from '../workspace/useWorkspaceNamespace.ts';

/** A short plain-text note. Times are ISO 8601 strings. */
export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = { title: string; body: string };

export const NOTE_LIMITS = { title: 100, body: 5000 } as const;

export type NoteFieldProblem = 'required' | 'tooLong';
export type NoteProblems = Partial<Record<keyof NoteInput, NoteFieldProblem>>;

export function validateNote(input: NoteInput): NoteProblems {
  const problems: NoteProblems = {};
  const title = input.title.trim();
  if (!title) problems.title = 'required';
  else if (charCount(title) > NOTE_LIMITS.title) problems.title = 'tooLong';
  if (charCount(input.body) > NOTE_LIMITS.body) problems.body = 'tooLong';
  return problems;
}

function isNote(value: unknown): value is Note {
  const note = value as Note;
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    typeof note.body === 'string' &&
    typeof note.createdAt === 'string' &&
    typeof note.updatedAt === 'string'
  );
}

const newestFirst = (a: Note, b: Note) => b.updatedAt.localeCompare(a.updatedAt);

export type NotesRepository = Repository<Note, NoteInput>;

/** Notes kept in this browser for one account. */
export function createLocalNotesRepository(namespace: string): NotesRepository {
  const store = createLocalCollection(namespace, 'notes', isNote);

  function checked(input: NoteInput): NoteInput {
    if (Object.keys(validateNote(input)).length > 0) throw new WorkspaceStorageError('invalid');
    return { title: input.title.trim(), body: input.body };
  }

  return {
    async list() {
      return [...store.load()].sort(newestFirst);
    },
    async create(input) {
      const now = new Date().toISOString();
      const note: Note = { id: newId(), ...checked(input), createdAt: now, updatedAt: now };
      store.mutate((notes) => [note, ...notes]);
      return note;
    },
    async update(id, input) {
      const fields = checked(input);
      let saved: Note | undefined;
      store.mutate((notes) =>
        notes.map((note) => {
          if (note.id !== id) return note;
          saved = { ...note, ...fields, updatedAt: new Date().toISOString() };
          return saved;
        }),
      );
      if (!saved) throw new WorkspaceStorageError('notFound');
      return saved;
    },
    async remove(id) {
      store.mutate((notes) => notes.filter((note) => note.id !== id));
    },
    async resetStorage() {
      store.reset();
    },
    subscribe: store.subscribe,
  };
}

/** The signed-in account's notes. */
export function useNotes() {
  const namespace = useWorkspaceNamespace();
  const repository = useMemo(() => createLocalNotesRepository(namespace), [namespace]);
  return useCollection(repository);
}
