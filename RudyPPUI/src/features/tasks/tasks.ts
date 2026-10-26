import { useMemo } from 'react';
import { newId } from '../../lib/id.ts';
import { charCount } from '../../lib/text.ts';
import type { Repository } from '../workspace/repository.ts';
import { createLocalCollection, WorkspaceStorageError } from '../workspace/storage.ts';
import { useCollection } from '../workspace/useCollection.ts';
import { useWorkspaceNamespace } from '../workspace/useWorkspaceNamespace.ts';

export type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = { title: string };
export type TaskChanges = { done: boolean };

export const TASK_LIMITS = { title: 200 } as const;

export type TaskFilter = 'all' | 'open' | 'done';
export const TASK_FILTERS: TaskFilter[] = ['all', 'open', 'done'];

export function isTaskFilter(value: string | null): value is TaskFilter {
  return value === 'all' || value === 'open' || value === 'done';
}

export function validateTaskTitle(title: string): 'required' | 'tooLong' | null {
  const trimmed = title.trim();
  if (!trimmed) return 'required';
  if (charCount(trimmed) > TASK_LIMITS.title) return 'tooLong';
  return null;
}

function isTask(value: unknown): value is Task {
  const task = value as Task;
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.done === 'boolean' &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  );
}

const newestFirst = (a: Task, b: Task) => b.createdAt.localeCompare(a.createdAt);

export type TasksRepository = Repository<Task, TaskInput, TaskChanges>;

export function createLocalTasksRepository(namespace: string): TasksRepository {
  const store = createLocalCollection(namespace, 'tasks', isTask);

  return {
    async list() {
      return [...store.load()].sort(newestFirst);
    },
    async create(input) {
      if (validateTaskTitle(input.title)) throw new WorkspaceStorageError('invalid');
      const now = new Date().toISOString();
      const task: Task = {
        id: newId(),
        title: input.title.trim(),
        done: false,
        createdAt: now,
        updatedAt: now,
      };
      store.mutate((tasks) => [task, ...tasks]);
      return task;
    },
    async update(id, changes) {
      let saved: Task | undefined;
      store.mutate((tasks) =>
        tasks.map((task) => {
          if (task.id !== id) return task;
          saved = { ...task, done: changes.done, updatedAt: new Date().toISOString() };
          return saved;
        }),
      );
      if (!saved) throw new WorkspaceStorageError('notFound');
      return saved;
    },
    async remove(id) {
      store.mutate((tasks) => tasks.filter((task) => task.id !== id));
    },
    async resetStorage() {
      store.reset();
    },
    subscribe: store.subscribe,
  };
}

export function useTasks() {
  const namespace = useWorkspaceNamespace();
  const repository = useMemo(() => createLocalTasksRepository(namespace), [namespace]);
  return useCollection(repository);
}
