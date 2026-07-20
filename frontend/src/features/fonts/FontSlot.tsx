import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Type } from 'lucide-react'
import type { UploadedFont } from '@/types'
import styles from './FontSlot.module.css'

interface Props {
  label:    string
  hint:     string
  font:     UploadedFont | null
  lang:     'ar' | 'en'
  onLoad:   (font: UploadedFont) => void
  onRemove: () => void
}

/**
 * Single font slot: load, display loaded state, replace, remove.
 * Registers the font with FontFace API for live CSS preview.
 */
export function FontSlot({ label, hint, font, lang, onLoad, onRemove }: Props) {
  const { t }  = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const family   = `UserFont-${lang}`

  async function handleFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'ttf' && ext !== 'otf') {
      alert('Only TTF and OTF fonts are supported.')
      return
    }
    try {
      const objectUrl = URL.createObjectURL(file)
      // Register with browser FontFace API for live preview
      const ff = new FontFace(family, `url(${objectUrl})`)
      await ff.load()
      document.fonts.add(ff)

      onLoad({ id: `${lang}-${Date.now()}`, file, fileName: file.name, objectUrl })
    } catch (e) {
      alert(t('fontError', { message: String(e) }))
    }
  }

  return (
    <div className={styles.slot}>
      <input
        ref={inputRef}
        type="file"
        accept=".ttf,.otf"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        aria-label={`${label} file`}
      />

      {font ? (
        <div className={styles.loaded} style={{ fontFamily: family }}>
          <Type size={14} aria-hidden />
          <span className="truncate" style={{ flex: 1 }}>{font.fileName}</span>
          <span className={styles.badge}>{t('loaded')}</span>
          <button
            className={styles.act}
            onClick={() => inputRef.current?.click()}
            aria-label={t('replace')}
            title={t('replace')}
          >↺</button>
          <button
            className={styles.act}
            onClick={() => { URL.revokeObjectURL(font.objectUrl); onRemove() }}
            aria-label={t('remove')}
            title={t('remove')}
          >✕</button>
        </div>
      ) : (
        <button
          className={styles.loadBtn}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <Type size={16} aria-hidden />
          <span className={styles.btnText}>
            <span className={styles.btnLabel}>{label}</span>
            <span className={styles.btnHint}>{hint}</span>
          </span>
        </button>
      )}
    </div>
  )
}
