import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/state/appStore'
import { selectValidation } from '@/state/selectors'
import { ValidationDialog } from '@/features/validation/ValidationDialog'
import styles from './WorkspaceFooter.module.css'

export function WorkspaceFooter() {
  const { t }      = useTranslation()
  const state      = useAppStore()
  const validation = selectValidation(state)
  const [showDlg, setShowDlg] = useState(false)

  return (
    <>
      <div className={styles.footer}>
        <span className={styles.statusMsg} aria-live="polite">
          {validation.isReady
            ? t('readyCount', { count: state.records.length })
            : t('completeSteps')}
        </span>
        <button
          className={[styles.generateBtn, !validation.isReady ? styles.disabled : ''].join(' ')}
          onClick={() => setShowDlg(true)}
          disabled={false} /* allow opening dialog to see errors */
          aria-label={t('validateAll')}
        >
          {t('generate')}
        </button>
      </div>
      {showDlg && <ValidationDialog onClose={() => setShowDlg(false)} />}
    </>
  )
}
