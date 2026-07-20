import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { Button } from './Button'

export function HelpDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <Modal
      title={t('help')}
      onClose={onClose}
      maxWidth={520}
      footer={<Button variant="primary" onClick={onClose}>{t('close')}</Button>}
    >
      <ol style={{ paddingInlineStart: '1.25rem', lineHeight: 2 }}>
        <li>{t('steps.pdf')} — Upload your PDF certificate template.</li>
        <li>{t('steps.language')} — Choose auto-detect or force Arabic/English.</li>
        <li>{t('steps.fonts')} — Load TTF/OTF fonts for Arabic and English names.</li>
        <li>{t('steps.csv')} — Import a CSV with a <code>name</code> column (and optional <code>role</code>).</li>
        <li>{t('steps.name')} — Position the name ruler and configure font size, color, rotation.</li>
        <li>{t('steps.role')} — (Optional) Configure role text placement and style.</li>
        <li>{t('steps.export')} — Choose export mode and generate.</li>
      </ol>
      <p style={{ marginTop: '1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
        {t('pdfSizePreserved')}
      </p>
    </Modal>
  )
}
