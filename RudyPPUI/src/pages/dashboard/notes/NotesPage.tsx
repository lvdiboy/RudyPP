import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import Alert from '../../../components/ui/Alert/Alert.tsx';
import Button from '../../../components/ui/Button/Button.tsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog.tsx';
import TextArea from '../../../components/ui/TextField/TextArea.tsx';
import TextField from '../../../components/ui/TextField/TextField.tsx';
import { noteDraftStore, type NoteDraft } from '../../../features/notes/draft.ts';
import {
  NOTE_LIMITS,
  useNotes,
  validateNote,
  type Note,
  type NoteFieldProblem,
  type NoteProblems,
} from '../../../features/notes/notes.ts';
import Counter from '../../../features/workspace/components/Counter.tsx';
import StatusMessage from '../../../features/workspace/components/StatusMessage.tsx';
import StorageProblem from '../../../features/workspace/components/StorageProblem.tsx';
import tool from '../../../features/workspace/components/tool.module.css';
import WorkspacePage from '../../../features/workspace/components/WorkspacePage.tsx';
import { failureMessage } from '../../../features/workspace/failureMessage.ts';
import type { StorageFailure } from '../../../features/workspace/storage.ts';
import { useWorkspaceNamespace } from '../../../features/workspace/useWorkspaceNamespace.ts';
import type { Messages } from '../../../i18n/locales/en.ts';
import { useI18n } from '../../../i18n/useI18n.ts';
import { matchesQuery } from '../../../lib/text.ts';

type Editor = {
  /** null while writing a new note. */
  noteId: string | null;
  title: string;
  body: string;
  /** The saved values, to know whether anything changed. */
  savedTitle: string;
  savedBody: string;
  /** updatedAt of the note when editing began, to notice changes from another tab. */
  baseUpdatedAt: string | null;
};

// What to announce; turned into text at render time so it follows a language switch
type Status = 'saved' | 'deleted' | null;

export default function NotesPage() {
  const { t, locale } = useI18n();
  const n = t.notes;
  const w = t.workspace;
  const notes = useNotes();
  const namespace = useWorkspaceNamespace();
  const drafts = useMemo(() => noteDraftStore(namespace), [namespace]);
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState('');
  // A draft left from a previous visit is offered back before anything else is edited
  const [pendingDraft, setPendingDraft] = useState<NoteDraft | null>(() => drafts.read());
  // Opened directly with ?new=1 (from the overview) starts a new note, unless a draft waits
  const [editor, setEditor] = useState<Editor | null>(() =>
    params.get('new') === '1' && !drafts.read() ? emptyEditor() : null,
  );
  const [problems, setProblems] = useState<NoteProblems>({});
  const [saveFailure, setSaveFailure] = useState<StorageFailure | null>(null);
  const [actionFailure, setActionFailure] = useState<StorageFailure | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [deleting, setDeleting] = useState<Note | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [seenExternal, setSeenExternal] = useState(notes.externalChanges);

  // The ?new=1 flag has done its job once the editor is open
  useEffect(() => {
    if (params.get('new') === '1') setParams({}, { replace: true });
  }, [params, setParams]);

  // Put the cursor in the title when the editor opens
  const editorKey = editor ? (editor.noteId ?? 'new') : null;
  useEffect(() => {
    if (editorKey) titleRef.current?.focus();
  }, [editorKey]);

  const dirty =
    !!editor && (editor.title !== editor.savedTitle || editor.body !== editor.savedBody);
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });
  const visible = notes.items.filter((note) => matchesQuery(query, note.title, note.body));

  // Changes made in another tab to the note being edited
  const editedNote = editor?.noteId ? notes.items.find((note) => note.id === editor.noteId) : null;
  const editedElsewhere =
    !!editor?.noteId &&
    notes.status === 'ready' &&
    (!editedNote || editedNote.updatedAt !== editor.baseUpdatedAt);

  function rememberOpener() {
    openerRef.current = document.activeElement as HTMLElement | null;
  }

  function openNew() {
    rememberOpener();
    setEditor(emptyEditor());
    setProblems({});
    setSaveFailure(null);
    setStatus(null);
  }

  function openEdit(note: Note) {
    rememberOpener();
    setEditor({
      noteId: note.id,
      title: note.title,
      body: note.body,
      savedTitle: note.title,
      savedBody: note.body,
      baseUpdatedAt: note.updatedAt,
    });
    setProblems({});
    setSaveFailure(null);
    setStatus(null);
  }

  function change(field: 'title' | 'body', value: string) {
    if (!editor) return;
    const next = { ...editor, [field]: value };
    setEditor(next);
    drafts.write({ noteId: next.noteId, title: next.title, body: next.body });
  }

  function close() {
    setEditor(null);
    setProblems({});
    setSaveFailure(null);
    setConfirmingDiscard(false);
    drafts.clear();
    openerRef.current?.focus();
  }

  function cancel() {
    if (dirty) setConfirmingDiscard(true);
    else close();
  }

  function restoreDraft(draft: NoteDraft) {
    const existing = draft.noteId ? notes.items.find((note) => note.id === draft.noteId) : null;
    setEditor({
      // A draft for a note deleted in the meantime comes back as a new note
      noteId: existing ? existing.id : null,
      title: draft.title,
      body: draft.body,
      savedTitle: existing ? existing.title : '',
      savedBody: existing ? existing.body : '',
      baseUpdatedAt: existing ? existing.updatedAt : null,
    });
    setPendingDraft(null);
  }

  function discardDraft() {
    drafts.clear();
    setPendingDraft(null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const input = { title: editor.title, body: editor.body };
    const found = validateNote(input);
    setProblems(found);
    setSaveFailure(null);
    if (Object.keys(found).length > 0) {
      titleRef.current?.focus();
      return;
    }
    setSaving(true);
    const result = editor.noteId
      ? await notes.update(editor.noteId, input)
      : await notes.create(input);
    setSaving(false);
    if (!result.ok) {
      // Keep everything typed; say why it wasn't saved
      setSaveFailure(result.failure);
      return;
    }
    setSeenExternal(notes.externalChanges);
    close();
    setStatus('saved');
  }

  async function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    const result = await notes.remove(target.id);
    setSeenExternal(notes.externalChanges);
    if (!result.ok) {
      setActionFailure(result.failure);
      return;
    }
    setActionFailure(null);
    setStatus('deleted');
    if (editor?.noteId === target.id) close();
  }

  const statusText =
    status === 'saved'
      ? n.saved
      : status === 'deleted'
        ? n.deleted
        : notes.externalChanges > seenExternal
          ? w.storage.updatedElsewhere
          : null;

  return (
    <WorkspacePage
      documentTitle={n.title}
      heading={w.modules.notes.title}
      intro={n.intro}
      actions={
        !editor &&
        notes.status === 'ready' && (
          <Button variant="solid" onClick={openNew} disabled={!!pendingDraft}>
            <Plus size={18} aria-hidden /> {n.newNote}
          </Button>
        )
      }
    >
      <StatusMessage message={statusText} />

      {notes.loadFailure && <StorageProblem failure={notes.loadFailure} onReset={notes.reset} />}
      {actionFailure && <Alert>{failureMessage(actionFailure, t)}</Alert>}

      {pendingDraft && !editor && notes.status === 'ready' && (
        <div className={`${tool.panel} ${tool.notice}`}>
          <p>{n.draftFound}</p>
          <div className={tool.formActions}>
            <Button variant="solid" onClick={() => restoreDraft(pendingDraft)}>
              {n.restoreDraft}
            </Button>
            <Button variant="secondary" onClick={discardDraft}>
              {n.discardDraft}
            </Button>
          </div>
        </div>
      )}

      {editor && (
        <section className={tool.panel} aria-labelledby="note-editor-title">
          <h2 id="note-editor-title" className={tool.panelTitle}>
            {editor.noteId ? n.editorEdit : n.editorNew}
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
            {editedElsewhere && (
              <Alert tone="info">
                {editedNote ? w.storage.changedElsewhere : w.storage.notFound}
              </Alert>
            )}
            {saveFailure && <Alert>{failureMessage(saveFailure, t)}</Alert>}
            <TextField
              ref={titleRef}
              label={n.titleLabel}
              name="title"
              value={editor.title}
              onChange={(event) => change('title', event.target.value)}
              error={fieldError(problems.title, NOTE_LIMITS.title, t)}
              hint={<Counter text={editor.title.trim()} max={NOTE_LIMITS.title} />}
            />
            <TextArea
              label={n.bodyLabel}
              name="body"
              rows={7}
              value={editor.body}
              onChange={(event) => change('body', event.target.value)}
              error={fieldError(problems.body, NOTE_LIMITS.body, t)}
              hint={<Counter text={editor.body} max={NOTE_LIMITS.body} />}
            />
            <p className={tool.meta}>{n.draftNote}</p>
            <div className={tool.formActions}>
              <Button type="submit" variant="solid" loading={saving}>
                {saving ? n.saving : n.save}
              </Button>
              <Button variant="secondary" onClick={cancel} disabled={saving}>
                {w.cancel}
              </Button>
            </div>
          </form>
        </section>
      )}

      {notes.status === 'ready' && (
        <>
          {notes.items.length > 0 && (
            <div className={tool.toolbar}>
              <div className={tool.search}>
                <TextField
                  label={n.searchLabel}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
          )}

          {notes.items.length === 0 ? (
            <p className={tool.empty}>{n.empty}</p>
          ) : visible.length === 0 ? (
            <p className={tool.empty}>{n.noResults(query.trim())}</p>
          ) : (
            <ul className={tool.list} aria-label={n.listLabel}>
              {visible.map((note) => (
                <li key={note.id}>
                  <article className={tool.item}>
                    <div className={tool.itemHeader}>
                      <h2 className={tool.itemTitle}>{note.title}</h2>
                      <time className={tool.meta} dateTime={note.updatedAt}>
                        {n.updated(dateFormat.format(new Date(note.updatedAt)))}
                      </time>
                    </div>
                    {note.body && <p className={tool.body}>{note.body}</p>}
                    <div className={tool.itemActions}>
                      <button
                        type="button"
                        className={tool.smallButton}
                        onClick={() => openEdit(note)}
                        disabled={!!editor || !!pendingDraft}
                        aria-label={`${w.edit}: ${note.title}`}
                      >
                        <Pencil size={15} aria-hidden /> {w.edit}
                      </button>
                      <button
                        type="button"
                        className={tool.dangerButton}
                        onClick={() => setDeleting(note)}
                        aria-label={`${w.delete}: ${note.title}`}
                      >
                        <Trash2 size={15} aria-hidden /> {w.delete}
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmingDiscard}
        tone="danger"
        title={n.discardTitle}
        message={n.discardMessage}
        confirmLabel={n.discard}
        cancelLabel={n.keepEditing}
        onCancel={() => {
          setConfirmingDiscard(false);
          titleRef.current?.focus();
        }}
        onConfirm={close}
      />
      <ConfirmDialog
        open={!!deleting}
        tone="danger"
        title={n.deleteTitle}
        message={deleting ? n.deleteMessage(deleting.title) : ''}
        confirmLabel={w.delete}
        cancelLabel={w.cancel}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </WorkspacePage>
  );
}

function emptyEditor(): Editor {
  return { noteId: null, title: '', body: '', savedTitle: '', savedBody: '', baseUpdatedAt: null };
}

function fieldError(problem: NoteFieldProblem | undefined, max: number, t: Messages) {
  if (problem === 'required') return t.workspace.required;
  if (problem === 'tooLong') return t.workspace.tooLong(max);
  return undefined;
}
