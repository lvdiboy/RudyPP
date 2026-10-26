import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import Alert from '../../../components/ui/Alert/Alert.tsx';
import Button from '../../../components/ui/Button/Button.tsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog.tsx';
import TextField from '../../../components/ui/TextField/TextField.tsx';
import {
  TASK_FILTERS,
  TASK_LIMITS,
  isTaskFilter,
  useTasks,
  validateTaskTitle,
  type Task,
} from '../../../features/tasks/tasks.ts';
import Counter from '../../../features/workspace/components/Counter.tsx';
import StatusMessage from '../../../features/workspace/components/StatusMessage.tsx';
import StorageProblem from '../../../features/workspace/components/StorageProblem.tsx';
import tool from '../../../features/workspace/components/tool.module.css';
import WorkspacePage from '../../../features/workspace/components/WorkspacePage.tsx';
import { failureMessage } from '../../../features/workspace/failureMessage.ts';
import type { StorageFailure } from '../../../features/workspace/storage.ts';
import { useI18n } from '../../../i18n/useI18n.ts';
import styles from './TasksPage.module.css';

// What to announce; turned into text at render time so it follows a language switch
type Status =
  | { kind: 'added' }
  | { kind: 'deleted' }
  | { kind: 'toggled'; title: string; done: boolean }
  | null;

export default function TasksPage() {
  const { t } = useI18n();
  const k = t.tasks;
  const w = t.workspace;
  const tasks = useTasks();
  const [params, setParams] = useSearchParams();
  // The filter lives in the URL (?filter=open), so refresh and back/forward keep it
  const filterParam = params.get('filter');
  const filter = isTaskFilter(filterParam) ? filterParam : 'all';

  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState<'required' | 'tooLong' | null>(null);
  const [failure, setFailure] = useState<StorageFailure | null>(null);
  const [adding, setAdding] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [seenExternal, setSeenExternal] = useState(tasks.externalChanges);

  // Arriving with ?new=1 (from the overview) puts the cursor in the new to-do field
  useEffect(() => {
    if (params.get('new') !== '1') return;
    inputRef.current?.focus();
    const next = new URLSearchParams(params);
    next.delete('new');
    setParams(next, { replace: true });
  }, [params, setParams]);

  const open = tasks.items.filter((task) => !task.done);
  const done = tasks.items.filter((task) => task.done);
  const visible = filter === 'open' ? open : filter === 'done' ? done : tasks.items;

  function setFilter(next: 'all' | 'open' | 'done') {
    const nextParams = new URLSearchParams(params);
    if (next === 'all') nextParams.delete('filter');
    else nextParams.set('filter', next);
    setParams(nextParams);
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateTaskTitle(title);
    setProblem(found);
    setFailure(null);
    if (found) {
      inputRef.current?.focus();
      return;
    }
    setAdding(true);
    const result = await tasks.create({ title });
    setAdding(false);
    setSeenExternal(tasks.externalChanges);
    if (!result.ok) {
      setFailure(result.failure);
      return;
    }
    setTitle('');
    setStatus({ kind: 'added' });
    inputRef.current?.focus();
  }

  async function toggle(task: Task) {
    const result = await tasks.update(task.id, { done: !task.done });
    setSeenExternal(tasks.externalChanges);
    if (!result.ok) {
      setFailure(result.failure);
      return;
    }
    setFailure(null);
    setStatus({ kind: 'toggled', title: task.title, done: !task.done });
  }

  async function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    const result = await tasks.remove(target.id);
    setSeenExternal(tasks.externalChanges);
    if (!result.ok) {
      setFailure(result.failure);
      return;
    }
    setFailure(null);
    setStatus({ kind: 'deleted' });
  }

  const statusText = !status
    ? tasks.externalChanges > seenExternal
      ? w.storage.updatedElsewhere
      : null
    : status.kind === 'added'
      ? k.added
      : status.kind === 'deleted'
        ? k.deleted
        : status.done
          ? k.markedDone(status.title)
          : k.reopened(status.title);

  return (
    <WorkspacePage documentTitle={k.title} heading={w.modules.tasks.title} intro={k.intro}>
      <StatusMessage message={statusText} />
      {tasks.loadFailure && <StorageProblem failure={tasks.loadFailure} onReset={tasks.reset} />}
      {failure && <Alert>{failureMessage(failure, t)}</Alert>}

      {tasks.status === 'ready' && (
        <>
          <form className={`${tool.panel} ${styles.addForm}`} onSubmit={add} noValidate>
            <div className={styles.addField}>
              <TextField
                ref={inputRef}
                label={k.newLabel}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                error={
                  problem === 'required'
                    ? w.required
                    : problem === 'tooLong'
                      ? w.tooLong(TASK_LIMITS.title)
                      : undefined
                }
                hint={<Counter text={title.trim()} max={TASK_LIMITS.title} />}
              />
            </div>
            <Button type="submit" variant="solid" loading={adding} className={styles.addButton}>
              {!adding && <Plus size={18} aria-hidden />} {adding ? k.adding : k.add}
            </Button>
          </form>

          <div className={styles.filterRow}>
            <div className={styles.filters} role="group" aria-label={k.filterLabel}>
              {TASK_FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={styles.filter}
                  aria-pressed={filter === option}
                  onClick={() => setFilter(option)}
                >
                  {k.filters[option]}
                </button>
              ))}
            </div>
            <p className={tool.meta}>{k.summary(open.length, done.length)}</p>
          </div>

          {visible.length === 0 ? (
            <p className={tool.empty}>{k.empty[filter]}</p>
          ) : (
            <ul className={tool.list} aria-label={k.listLabel}>
              {visible.map((task) => (
                <li key={task.id} className={`${tool.item} ${styles.task}`}>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggle(task)}
                      aria-describedby={`task-status-${task.id}`}
                    />
                    <span className={task.done ? styles.titleDone : styles.title}>
                      {task.title}
                    </span>
                  </label>
                  <span
                    id={`task-status-${task.id}`}
                    className={task.done ? styles.badgeDone : styles.badge}
                  >
                    {task.done ? k.statusDone : k.statusOpen}
                  </span>
                  <button
                    type="button"
                    className={tool.dangerButton}
                    onClick={() => setDeleting(task)}
                    aria-label={`${w.delete}: ${task.title}`}
                  >
                    <Trash2 size={15} aria-hidden />
                    <span className={styles.deleteText}>{w.delete}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleting}
        tone="danger"
        title={k.deleteTitle}
        message={deleting ? k.deleteMessage(deleting.title) : ''}
        confirmLabel={w.delete}
        cancelLabel={w.cancel}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </WorkspacePage>
  );
}
