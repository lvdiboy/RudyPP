import { HardDrive, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import coastPhoto from '../../assets/coast.jpeg';
import Alert from '../../components/ui/Alert/Alert.tsx';
import { useAuth } from '../../features/auth/useAuth.ts';
import { displayHost, safeHttpUrl, useBookmarks } from '../../features/bookmarks/bookmarks.ts';
import { useNotes } from '../../features/notes/notes.ts';
import { useTasks } from '../../features/tasks/tasks.ts';
import ModuleCard from '../../features/workspace/components/ModuleCard.tsx';
import StatusMessage from '../../features/workspace/components/StatusMessage.tsx';
import theme from '../../features/workspace/components/theme.module.css';
import tool from '../../features/workspace/components/tool.module.css';
import { failureMessage } from '../../features/workspace/failureMessage.ts';
import { activeModule } from '../../features/workspace/modules.ts';
import type { StorageFailure } from '../../features/workspace/storage.ts';
import { useI18n } from '../../i18n/useI18n.ts';
import styles from './DashboardPage.module.css';

// Sections of the old dashboard, now on the learning page
const LEARNING_ANCHORS = new Set(['#topics', '#journal', '#project', '#playground']);

/** /dashboard: the overview. Old learning links such as /dashboard#journal move to the learning page. */
export default function DashboardPage() {
  const { hash } = useLocation();
  if (LEARNING_ANCHORS.has(hash)) {
    return <Navigate to={{ pathname: '/dashboard/learning', hash }} replace />;
  }
  return <Overview />;
}

function Overview() {
  const { t, locale } = useI18n();
  const w = t.workspace;
  const o = w.overview;
  const { session } = useAuth();
  const notes = useNotes();
  const bookmarks = useBookmarks();
  const tasks = useTasks();
  // Title of the to-do just ticked off here, announced in the current language
  const [completed, setCompleted] = useState<string | null>(null);
  const [completeFailure, setCompleteFailure] = useState<StorageFailure | null>(null);

  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });
  const openTasks = tasks.items.filter((task) => !task.done);
  // Counts come straight from the stored data; "—" when it couldn't be read
  const count = (ready: boolean, value: number, format: (n: number) => string) =>
    ready ? format(value) : '—';

  return (
    <div className={`${theme.theme} ${styles.page}`}>
      <title>{o.title}</title>

      <section className={styles.welcome} aria-labelledby="overview-title">
        <div className={styles.welcomeText}>
          <p className={styles.kicker}>{w.brandSub}</p>
          <h1 id="overview-title" className={styles.title}>
            {o.greeting(session?.username ?? '')}
          </h1>
          <p className={styles.intro}>{o.intro}</p>
        </div>
        <img className={styles.photo} src={coastPhoto} alt="" decoding="async" />
      </section>

      <section aria-labelledby="modules-title" className={styles.section}>
        <h2 id="modules-title" className={styles.sectionTitle}>
          {o.modulesHeading}
        </h2>
        <div className={styles.modules}>
          <ModuleCard module={activeModule('learning')} stat={o.learningStat} />
          <ModuleCard
            module={activeModule('notes')}
            stat={count(notes.status === 'ready', notes.items.length, o.notesStat)}
          />
          <ModuleCard
            module={activeModule('bookmarks')}
            stat={count(bookmarks.status === 'ready', bookmarks.items.length, o.bookmarksStat)}
          />
          <ModuleCard
            module={activeModule('tasks')}
            stat={count(tasks.status === 'ready', openTasks.length, o.tasksStat)}
          />
        </div>
      </section>

      <div className={styles.columns}>
        <div className={styles.column}>
          <section className={tool.panel} aria-labelledby="recent-notes-title">
            <div className={styles.panelHeader}>
              <h2 id="recent-notes-title" className={tool.panelTitle}>
                {o.recentNotes}
              </h2>
              <Link to="/dashboard/notes" className={styles.viewAll}>
                {o.viewAll(w.modules.notes.title)}
              </Link>
            </div>
            {notes.loadFailure ? (
              <Alert>{failureMessage(notes.loadFailure, t)}</Alert>
            ) : notes.items.length === 0 ? (
              <EmptyState text={o.noNotes} action={o.writeFirstNote} to="/dashboard/notes?new=1" />
            ) : (
              <ul className={styles.recent}>
                {notes.items.slice(0, 3).map((note) => (
                  <li key={note.id}>
                    <span className={styles.recentTitle}>{note.title}</span>
                    <time className={tool.meta} dateTime={note.updatedAt}>
                      {t.notes.updated(dateFormat.format(new Date(note.updatedAt)))}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={tool.panel} aria-labelledby="recent-bookmarks-title">
            <div className={styles.panelHeader}>
              <h2 id="recent-bookmarks-title" className={tool.panelTitle}>
                {o.recentBookmarks}
              </h2>
              <Link to="/dashboard/bookmarks" className={styles.viewAll}>
                {o.viewAll(w.modules.bookmarks.title)}
              </Link>
            </div>
            {bookmarks.loadFailure ? (
              <Alert>{failureMessage(bookmarks.loadFailure, t)}</Alert>
            ) : bookmarks.items.length === 0 ? (
              <EmptyState
                text={o.noBookmarks}
                action={o.addFirstBookmark}
                to="/dashboard/bookmarks?new=1"
              />
            ) : (
              <ul className={styles.recent}>
                {bookmarks.items.slice(0, 3).map((bookmark) => {
                  const href = safeHttpUrl(bookmark.url);
                  return (
                    <li key={bookmark.id}>
                      {href ? (
                        <a
                          className={styles.recentTitle}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {bookmark.title}
                          <span className="visually-hidden"> ({t.bookmarks.newTab})</span>
                        </a>
                      ) : (
                        <span className={styles.recentTitle}>{bookmark.title}</span>
                      )}
                      <span className={tool.meta}>
                        {displayHost(bookmark.url)} ·{' '}
                        <time dateTime={bookmark.createdAt}>
                          {t.bookmarks.added(dateFormat.format(new Date(bookmark.createdAt)))}
                        </time>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <section className={tool.panel} aria-labelledby="open-tasks-title">
          <div className={styles.panelHeader}>
            <h2 id="open-tasks-title" className={tool.panelTitle}>
              {o.openTasks}
            </h2>
            <Link to="/dashboard/tasks?filter=open" className={styles.viewAll}>
              {o.viewAll(w.modules.tasks.title)}
            </Link>
          </div>
          <StatusMessage message={completed ? t.tasks.markedDone(completed) : null} />
          {completeFailure && <Alert>{failureMessage(completeFailure, t)}</Alert>}
          {tasks.loadFailure ? (
            <Alert>{failureMessage(tasks.loadFailure, t)}</Alert>
          ) : openTasks.length === 0 ? (
            <EmptyState text={o.noOpenTasks} action={o.addTask} to="/dashboard/tasks?new=1" />
          ) : (
            <ul className={styles.tasks}>
              {openTasks.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <label className={styles.task}>
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={async () => {
                        const result = await tasks.update(task.id, { done: true });
                        setCompleteFailure(result.ok ? null : result.failure);
                        setCompleted(result.ok ? task.title : null);
                      }}
                    />
                    <span>{task.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className={styles.localNotice}>
        <HardDrive size={16} aria-hidden />
        {o.localNotice}
      </p>
    </div>
  );
}

function EmptyState({ text, action, to }: { text: string; action: string; to: string }) {
  return (
    <div className={styles.empty}>
      <p>{text}</p>
      <Link to={to} className={tool.smallButton}>
        <Plus size={16} aria-hidden /> {action}
      </Link>
    </div>
  );
}
