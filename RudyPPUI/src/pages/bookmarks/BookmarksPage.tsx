import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import Alert from '../../components/ui/Alert/Alert.tsx';
import Button from '../../components/ui/Button/Button.tsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog/ConfirmDialog.tsx';
import TextArea from '../../components/ui/TextField/TextArea.tsx';
import TextField from '../../components/ui/TextField/TextField.tsx';
import {
  BOOKMARK_LIMITS,
  displayHost,
  safeHttpUrl,
  useBookmarks,
  validateBookmark,
  type Bookmark,
  type BookmarkFieldProblem,
  type BookmarkInput,
  type BookmarkProblems,
} from '../../features/bookmarks/bookmarks.ts';
import Counter from '../../features/workspace/components/Counter.tsx';
import StatusMessage from '../../features/workspace/components/StatusMessage.tsx';
import StorageProblem from '../../features/workspace/components/StorageProblem.tsx';
import tool from '../../features/workspace/components/tool.module.css';
import WorkspacePage from '../../features/workspace/components/WorkspacePage.tsx';
import { failureMessage } from '../../features/workspace/failureMessage.ts';
import type { StorageFailure } from '../../features/workspace/storage.ts';
import type { Messages } from '../../i18n/locales/en.ts';
import { useI18n } from '../../i18n/useI18n.ts';
import { matchesQuery } from '../../lib/text.ts';
import styles from './BookmarksPage.module.css';

type Editor = {
  bookmarkId: string | null;
  values: BookmarkInput;
  saved: BookmarkInput;
};

const EMPTY: BookmarkInput = { title: '', url: '', description: '' };

export default function BookmarksPage() {
  const { t, locale } = useI18n();
  const b = t.bookmarks;
  const w = t.workspace;
  const bookmarks = useBookmarks();
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<Editor | null>(() =>
    params.get('new') === '1' ? { bookmarkId: null, values: EMPTY, saved: EMPTY } : null,
  );
  const [problems, setProblems] = useState<BookmarkProblems>({});
  const [saveFailure, setSaveFailure] = useState<StorageFailure | null>(null);
  const [actionFailure, setActionFailure] = useState<StorageFailure | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'saved' | 'deleted' | null>(null);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [deleting, setDeleting] = useState<Bookmark | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [seenExternal, setSeenExternal] = useState(bookmarks.externalChanges);

  useEffect(() => {
    if (params.get('new') === '1') setParams({}, { replace: true });
  }, [params, setParams]);

  const editorKey = editor ? (editor.bookmarkId ?? 'new') : null;
  useEffect(() => {
    if (editorKey) titleRef.current?.focus();
  }, [editorKey]);

  const dirty =
    !!editor &&
    (Object.keys(EMPTY) as (keyof BookmarkInput)[]).some(
      (field) => editor.values[field] !== editor.saved[field],
    );
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const visible = bookmarks.items.filter((bookmark) =>
    matchesQuery(query, bookmark.title, bookmark.url, bookmark.description),
  );
  const editedExists =
    !editor?.bookmarkId || bookmarks.items.some((item) => item.id === editor.bookmarkId);

  function open(bookmark: Bookmark | null) {
    openerRef.current = document.activeElement as HTMLElement | null;
    const values = bookmark
      ? { title: bookmark.title, url: bookmark.url, description: bookmark.description }
      : EMPTY;
    setEditor({ bookmarkId: bookmark?.id ?? null, values, saved: values });
    setProblems({});
    setSaveFailure(null);
    setStatus(null);
  }

  function change(field: keyof BookmarkInput, value: string) {
    if (editor) setEditor({ ...editor, values: { ...editor.values, [field]: value } });
  }

  function close() {
    setEditor(null);
    setProblems({});
    setSaveFailure(null);
    setConfirmingDiscard(false);
    openerRef.current?.focus();
  }

  function cancel() {
    if (dirty) setConfirmingDiscard(true);
    else close();
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const found = validateBookmark(editor.values);
    setProblems(found);
    setSaveFailure(null);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    const result = editor.bookmarkId
      ? await bookmarks.update(editor.bookmarkId, editor.values)
      : await bookmarks.create(editor.values);
    setSaving(false);
    if (!result.ok) {
      setSaveFailure(result.failure);
      return;
    }
    setSeenExternal(bookmarks.externalChanges);
    close();
    setStatus('saved');
  }

  async function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    const result = await bookmarks.remove(target.id);
    setSeenExternal(bookmarks.externalChanges);
    if (!result.ok) {
      setActionFailure(result.failure);
      return;
    }
    setActionFailure(null);
    setStatus('deleted');
  }

  const statusText =
    status === 'saved'
      ? b.saved
      : status === 'deleted'
        ? b.deleted
        : bookmarks.externalChanges > seenExternal
          ? w.storage.updatedElsewhere
          : null;

  return (
    <WorkspacePage
      documentTitle={b.title}
      heading={w.modules.bookmarks.title}
      intro={b.intro}
      actions={
        !editor &&
        bookmarks.status === 'ready' && (
          <Button variant="solid" onClick={() => open(null)}>
            <Plus size={18} aria-hidden /> {b.newBookmark}
          </Button>
        )
      }
    >
      <StatusMessage message={statusText} />
      {bookmarks.loadFailure && (
        <StorageProblem failure={bookmarks.loadFailure} onReset={bookmarks.reset} />
      )}
      {actionFailure && <Alert>{failureMessage(actionFailure, t)}</Alert>}

      {editor && (
        <section className={tool.panel} aria-labelledby="bookmark-editor-title">
          <h2 id="bookmark-editor-title" className={tool.panelTitle}>
            {editor.bookmarkId ? b.editorEdit : b.editorNew}
          </h2>
          <form
            className={tool.form}
            onSubmit={save}
            noValidate
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                cancel();
              }
            }}
          >
            {!editedExists && <Alert tone="info">{w.storage.notFound}</Alert>}
            {saveFailure && <Alert>{failureMessage(saveFailure, t)}</Alert>}
            <TextField
              ref={titleRef}
              label={b.titleLabel}
              value={editor.values.title}
              onChange={(event) => change('title', event.target.value)}
              error={fieldError(problems.title, BOOKMARK_LIMITS.title, t)}
              hint={<Counter text={editor.values.title.trim()} max={BOOKMARK_LIMITS.title} />}
            />
            <TextField
              label={b.urlLabel}
              type="url"
              inputMode="url"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="https://"
              value={editor.values.url}
              onChange={(event) => change('url', event.target.value)}
              error={fieldError(problems.url, 0, t)}
              hint={b.urlHint}
            />
            <TextArea
              label={b.descriptionLabel}
              rows={3}
              value={editor.values.description}
              onChange={(event) => change('description', event.target.value)}
              error={fieldError(problems.description, BOOKMARK_LIMITS.description, t)}
              hint={
                <Counter
                  text={editor.values.description.trim()}
                  max={BOOKMARK_LIMITS.description}
                />
              }
            />
            <div className={tool.formActions}>
              <Button type="submit" variant="solid" loading={saving}>
                {saving ? b.saving : b.save}
              </Button>
              <Button variant="secondary" onClick={cancel} disabled={saving}>
                {w.cancel}
              </Button>
            </div>
          </form>
        </section>
      )}

      {bookmarks.status === 'ready' && (
        <>
          {bookmarks.items.length > 0 && (
            <div className={tool.toolbar}>
              <div className={tool.search}>
                <TextField
                  label={b.searchLabel}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
          )}
          {bookmarks.items.length === 0 ? (
            <p className={tool.empty}>{b.empty}</p>
          ) : visible.length === 0 ? (
            <p className={tool.empty}>{b.noResults(query.trim())}</p>
          ) : (
            <ul className={tool.list} aria-label={b.listLabel}>
              {visible.map((bookmark) => {
                const href = safeHttpUrl(bookmark.url);
                return (
                  <li key={bookmark.id}>
                    <article className={tool.item}>
                      <div className={tool.itemHeader}>
                        <h2 className={tool.itemTitle}>
                          {href ? (
                            <a
                              className={styles.link}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {bookmark.title}
                              <ExternalLink size={15} aria-hidden />
                              <span className="visually-hidden"> ({b.newTab})</span>
                            </a>
                          ) : (
                            bookmark.title
                          )}
                        </h2>
                        <time className={tool.meta} dateTime={bookmark.createdAt}>
                          {b.added(dateFormat.format(new Date(bookmark.createdAt)))}
                        </time>
                      </div>
                      <p className={styles.host}>{displayHost(bookmark.url)}</p>
                      {bookmark.description && <p className={tool.body}>{bookmark.description}</p>}
                      <div className={tool.itemActions}>
                        <button
                          type="button"
                          className={tool.smallButton}
                          onClick={() => open(bookmark)}
                          disabled={!!editor}
                          aria-label={`${w.edit}: ${bookmark.title}`}
                        >
                          <Pencil size={15} aria-hidden /> {w.edit}
                        </button>
                        <button
                          type="button"
                          className={tool.dangerButton}
                          onClick={() => setDeleting(bookmark)}
                          aria-label={`${w.delete}: ${bookmark.title}`}
                        >
                          <Trash2 size={15} aria-hidden /> {w.delete}
                        </button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmingDiscard}
        tone="danger"
        title={t.notes.discardTitle}
        message={t.notes.discardMessage}
        confirmLabel={t.notes.discard}
        cancelLabel={t.notes.keepEditing}
        onCancel={() => {
          setConfirmingDiscard(false);
          titleRef.current?.focus();
        }}
        onConfirm={close}
      />
      <ConfirmDialog
        open={!!deleting}
        tone="danger"
        title={b.deleteTitle}
        message={deleting ? b.deleteMessage(deleting.title) : ''}
        confirmLabel={w.delete}
        cancelLabel={w.cancel}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </WorkspacePage>
  );
}

function fieldError(problem: BookmarkFieldProblem | undefined, max: number, t: Messages) {
  if (problem === 'required') return t.workspace.required;
  if (problem === 'tooLong') return t.workspace.tooLong(max);
  if (problem === 'invalidUrl') return t.bookmarks.urlInvalid;
  return undefined;
}
