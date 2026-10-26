import { useState } from 'react';
import Alert from '../../../components/ui/Alert/Alert.tsx';
import Button from '../../../components/ui/Button/Button.tsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog.tsx';
import { useI18n } from '../../../i18n/useI18n.ts';
import { failureMessage } from '../failureMessage.ts';
import type { StorageFailure } from '../storage.ts';
import styles from './StorageProblem.module.css';

type StorageProblemProps = {
  failure: StorageFailure;
  /** Offered only for unreadable data, and only after the user confirms. */
  onReset?: () => Promise<unknown>;
};

/** Why a module's saved data couldn't be loaded, with a confirmed reset for corrupt data. */
export default function StorageProblem({ failure, onReset }: StorageProblemProps) {
  const { t } = useI18n();
  const s = t.workspace.storage;
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={styles.problem}>
      <Alert>{failureMessage(failure, t)}</Alert>
      {failure === 'corrupt' && onReset && (
        <>
          <Button variant="secondary" onClick={() => setConfirming(true)}>
            {s.reset}
          </Button>
          <ConfirmDialog
            open={confirming}
            tone="danger"
            title={s.resetTitle}
            message={s.resetMessage}
            confirmLabel={s.resetConfirm}
            cancelLabel={t.workspace.cancel}
            onCancel={() => setConfirming(false)}
            onConfirm={() => {
              setConfirming(false);
              void onReset();
            }}
          />
        </>
      )}
    </div>
  );
}
