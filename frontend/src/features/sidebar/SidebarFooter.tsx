import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/state/appStore'
import { selectValidation } from '@/state/selectors'
import { ValidationDialog } from '@/features/validation/ValidationDialog'
import { Button } from '@/components/common/Button'
import styles from './SidebarFooter.module.css'

export function SidebarFooter() {
  const { t } = useTranslation()
  const state      = useAppStore()
  const validation = selectValidation(state)
  const [showDlg, setShowDlg] = useState(false)

  return (
    <>
      <div className={styles.footer}>
        <div className={styles.status} aria-live="polite">
          {validation.isReady
            ? <span className={styles.ready}>● {t('ready')}</span>
            : <span className={styles.notReady}>○ {t('notReady')}</span>
          }
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setShowDlg(true)}
          aria-label={t('validateAll')}
        >
          {t('generate')}
        </Button>
      </div>

      {showDlg && <ValidationDialog onClose={() => setShowDlg(false)} />}
    </>
  )
}
