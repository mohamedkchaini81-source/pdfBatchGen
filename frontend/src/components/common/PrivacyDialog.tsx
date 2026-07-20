import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { Button } from './Button'

export function PrivacyDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <Modal
      title={t('privacyTitle')}
      onClose={onClose}
      maxWidth={440}
      footer={<Button variant="primary" onClick={onClose}>{t('close')}</Button>}
    >
      <p style={{ lineHeight: 1.7 }}>{t('privacyBody')}</p>
    </Modal>
  )
}
