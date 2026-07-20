import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/state/appStore'
import { selectValidation } from '@/state/selectors'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { ProgressDialog } from '@/features/export/ProgressDialog'
import type { ValidationIssue } from '@/types'
import styles from './ValidationDialog.module.css'

interface Props { onClose: () => void }

export function ValidationDialog({ onClose }: Props) {
  const { t }      = useTranslation()
  const state      = useAppStore()
  const validation = selectValidation(state)
  const [showProgress, setShowProgress] = useState(false)

  const issueLabel = (issue: ValidationIssue) => {
    const map: Record<string, string> = {
      needsPdf:      t('needsPdf'),
      needsCsv:      t('needsCsv'),
      needsArabic:   t('needsArabic'),
      needsEnglish:  t('needsEnglish'),
      invalidBox:    t('invalidBox'),
      invalidRoleBox: t('invalidRoleBox'),
      warningLong:   t('warningLong'),
    }
    return map[issue.key] ?? issue.key
  }

  if (showProgress) {
    return <ProgressDialog onClose={() => { setShowProgress(false); onClose() }} />
  }

  const allOk = validation.errors.length === 0 && validation.warnings.length === 0

  return (
    <Modal
      title={t('validationResults')}
      onClose={onClose}
      maxWidth={560}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>{t('close')}</Button>
          <Button
            variant="primary"
            disabled={!validation.isReady}
            onClick={() => setShowProgress(true)}
          >
            {t('generate')}
          </Button>
        </>
      }
    >
      <div
        className={styles.list}
        role="list"
        aria-label={t('validationResults')}
        aria-live="polite"
      >
        {allOk && (
          <IssueRow
            type="ok"
            icon={<CheckCircle size={18} aria-hidden />}
            title={t('allValid')}
            subtitle={t('validationPassed')}
          />
        )}
        {validation.errors.map((issue, i) => (
          <IssueRow
            key={i}
            type="error"
            icon={<XCircle size={18} aria-hidden />}
            title={issueLabel(issue)}
            subtitle={t('validationFailed')}
          />
        ))}
        {validation.warnings.map((issue, i) => (
          <IssueRow
            key={i}
            type="warning"
            icon={<AlertTriangle size={18} aria-hidden />}
            title={issueLabel(issue)}
            subtitle={t('warningLong')}
          />
        ))}
      </div>
    </Modal>
  )
}

function IssueRow({
  type, icon, title, subtitle,
}: {
  type: 'ok' | 'warning' | 'error'
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className={[styles.row, styles[type]].join(' ')} role="listitem">
      <span className={styles.rowIcon}>{icon}</span>
      <span className={styles.rowText}>
        <span className={styles.rowTitle}>{title}</span>
        <span className={styles.rowSub}>{subtitle}</span>
      </span>
    </div>
  )
}
