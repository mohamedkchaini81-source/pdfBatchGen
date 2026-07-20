import { useTranslation } from 'react-i18next'
import { Modal } from './Modal'
import { Button } from './Button'
import styles from './ShortcutsDialog.module.css'

const shortcuts = [
  { key: 'Ctrl + Enter',     action: 'Open validation / export dialog' },
  { key: 'Ctrl + O',         action: 'Open PDF template' },
  { key: 'Ctrl + Shift + O', action: 'Open CSV file' },
  { key: 'Ctrl + =',         action: 'Zoom in' },
  { key: 'Ctrl + -',         action: 'Zoom out' },
  { key: 'Shift + ?',        action: 'Open help dialog' },
  { key: 'Escape',           action: 'Close dialog' },
  { key: '← → ↑ ↓',          action: 'Move selected ruler (1%)' },
  { key: 'Shift + arrows',   action: 'Move ruler faster (5%)' },
]

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <Modal
      title={t('shortcutsTitle')}
      onClose={onClose}
      maxWidth={480}
      footer={<Button variant="primary" onClick={onClose}>{t('close')}</Button>}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Key</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {shortcuts.map((s) => (
            <tr key={s.key}>
              <td><kbd className={styles.kbd}>{s.key}</kbd></td>
              <td>{s.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  )
}
