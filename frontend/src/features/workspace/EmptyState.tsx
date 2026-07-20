import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import styles from './EmptyState.module.css'

export function EmptyState() {
  const { t } = useTranslation()
  return (
    <div className={styles.wrap} aria-label={t('startTitle')}>
      <div className={styles.iconRing} aria-hidden>
        <FileText size={40} color="var(--color-primary)" />
      </div>
      <h2 className={styles.title}>{t('startTitle')}</h2>
      <p className={styles.body}>{t('startBody')}</p>
    </div>
  )
}
