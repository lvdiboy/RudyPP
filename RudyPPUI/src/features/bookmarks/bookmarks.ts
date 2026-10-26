import { useMemo } from 'react';
import { newId } from '../../lib/id.ts';
import { charCount } from '../../lib/text.ts';
import type { Repository } from '../workspace/repository.ts';
import { createLocalCollection, WorkspaceStorageError } from '../workspace/storage.ts';
import { useCollection } from '../workspace/useCollection.ts';
import { useWorkspaceNamespace } from '../workspace/useWorkspaceNamespace.ts';

/** A saved link. Only what the user typed is stored; no page is fetched. */
export type Bookmark = {
  id: string;
  title: string;
  /** Always a normalized http(s) URL. */
  url: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type BookmarkInput = { title: string; url: string; description: string };

export const BOOKMARK_LIMITS = { title: 120, description: 500 } as const;

export type BookmarkFieldProblem = 'required' | 'tooLong' | 'invalidUrl';
export type BookmarkProblems = Partial<Record<keyof BookmarkInput, BookmarkFieldProblem>>;

/**
 * The normalized address if it is a complete http: or https: URL, else null.
 * Parsing with URL plus a protocol allow-list rejects javascript:, data:, file: and the like.
 */
export function safeHttpUrl(text: string): string | null {
  try {
    const url = new URL(text.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export function validateBookmark(input: BookmarkInput): BookmarkProblems {
  const problems: BookmarkProblems = {};
  const title = input.title.trim();
  if (!title) problems.title = 'required';
  else if (charCount(title) > BOOKMARK_LIMITS.title) problems.title = 'tooLong';
  if (!input.url.trim()) problems.url = 'required';
  else if (!safeHttpUrl(input.url)) problems.url = 'invalidUrl';
  if (charCount(input.description.trim()) > BOOKMARK_LIMITS.description) {
    problems.description = 'tooLong';
  }
  return problems;
}

/** Also re-checks the URL, so edited storage can't smuggle in a javascript: link. */
function isBookmark(value: unknown): value is Bookmark {
  const bookmark = value as Bookmark;
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof bookmark.id === 'string' &&
    typeof bookmark.title === 'string' &&
    typeof bookmark.url === 'string' &&
    safeHttpUrl(bookmark.url) !== null &&
    typeof bookmark.description === 'string' &&
    typeof bookmark.createdAt === 'string' &&
    typeof bookmark.updatedAt === 'string'
  );
}

/** "https://www.example.com/a" → "example.com", shown next to the title. */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

const newestFirst = (a: Bookmark, b: Bookmark) => b.updatedAt.localeCompare(a.updatedAt);

export type BookmarksRepository = Repository<Bookmark, BookmarkInput>;

export function createLocalBookmarksRepository(namespace: string): BookmarksRepository {
  const store = createLocalCollection(namespace, 'bookmarks', isBookmark);

  function checked(input: BookmarkInput): BookmarkInput {
    const url = safeHttpUrl(input.url);
    if (Object.keys(validateBookmark(input)).length > 0 || !url) {
      throw new WorkspaceStorageError('invalid');
    }
    return { title: input.title.trim(), url, description: input.description.trim() };
  }

  return {
    async list() {
      return [...store.load()].sort(newestFirst);
    },
    async create(input) {
      const now = new Date().toISOString();
      const bookmark: Bookmark = { id: newId(), ...checked(input), createdAt: now, updatedAt: now };
      store.mutate((bookmarks) => [bookmark, ...bookmarks]);
      return bookmark;
    },
    async update(id, input) {
      const fields = checked(input);
      let saved: Bookmark | undefined;
      store.mutate((bookmarks) =>
        bookmarks.map((bookmark) => {
          if (bookmark.id !== id) return bookmark;
          saved = { ...bookmark, ...fields, updatedAt: new Date().toISOString() };
          return saved;
        }),
      );
      if (!saved) throw new WorkspaceStorageError('notFound');
      return saved;
    },
    async remove(id) {
      store.mutate((bookmarks) => bookmarks.filter((bookmark) => bookmark.id !== id));
    },
    async resetStorage() {
      store.reset();
    },
    subscribe: store.subscribe,
  };
}

export function useBookmarks() {
  const namespace = useWorkspaceNamespace();
  const repository = useMemo(() => createLocalBookmarksRepository(namespace), [namespace]);
  return useCollection(repository);
}
