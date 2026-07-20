import { useState, type ElementType, type DragEvent } from 'react'
import styles from './UploadZone.module.css'

interface Props {
  label:          string
  subtitle:       string
  icon:           ElementType
  accept:         string
  onFileSelected: (file: File) => void
  onBrowse:       () => void
}

/**
 * Dashed upload zone — supports click-to-browse and drag-and-drop.
 * Mirrors Flutter UploadZone exactly.
 */
export function UploadZone({ label, subtitle, icon: Icon, accept, onFileSelected, onBrowse }: Props) {
  const [dragging, setDragging] = useState(false)

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    setDragging(true)
  }
  function onDragLeave() { setDragging(false) }
  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const allowed = accept.replace(/\./g, '').split(',').map((a) => a.trim())
    if (allowed.some((a) => a === ext || file.type.includes(a))) {
      onFileSelected(file)
    }
  }

  return (
    <div
      className={[styles.zone, dragging ? styles.dragging : ''].filter(Boolean).join(' ')}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onBrowse}
      role="button"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBrowse() } }}
    >
      <span className={styles.iconBox} aria-hidden>
        <Icon size={20} color="var(--color-primary)" />
      </span>
      <span className={styles.textBox}>
        <span className={styles.zonelabel}>{label}</span>
        <span className={styles.zoneSubtitle}>{subtitle}</span>
      </span>
    </div>
  )
}
