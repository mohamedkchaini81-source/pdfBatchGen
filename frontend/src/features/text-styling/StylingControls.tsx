import { useTranslation } from 'react-i18next'
import styles from './StylingControls.module.css'

const WEIGHT_OPTIONS = [
  { label: 'Thin',      value: 100 },
  { label: 'Light',     value: 300 },
  { label: 'Regular',   value: 400 },
  { label: 'Medium',    value: 500 },
  { label: 'SemiBold',  value: 600 },
  { label: 'Bold',      value: 700 },
  { label: 'ExtraBold', value: 800 },
]

interface Props {
  maxFontSize:  number
  colorHex:     string
  rotation:     number
  fontWeight:   number
  fontStyle:    'normal' | 'italic'
  showFontStyle: boolean
  onMaxFontSize: (v: number) => void
  onColor:       (v: string) => void
  onRotation:    (v: number) => void
  onFontWeight:  (v: number) => void
  onFontStyle:   (v: 'normal' | 'italic') => void
}

export function StylingControls({
  maxFontSize, colorHex, rotation, fontWeight, fontStyle,
  showFontStyle, onMaxFontSize, onColor, onRotation, onFontWeight, onFontStyle,
}: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles.grid}>
      {/* Max font size */}
      <label className={styles.field}>
        <span className={styles.lbl}>{t('maxFontSize')}</span>
        <input
          type="number"
          className={styles.input}
          value={maxFontSize}
          min={8}
          max={500}
          onChange={(e) => onMaxFontSize(parseInt(e.target.value) || 8)}
        />
      </label>

      {/* Color */}
      <label className={styles.field}>
        <span className={styles.lbl}>{t('color')}</span>
        <div className={styles.colorRow}>
          <input
            type="color"
            className={styles.colorPicker}
            value={colorHex}
            onChange={(e) => onColor(e.target.value)}
            aria-label={t('color')}
          />
          <input
            type="text"
            className={styles.input}
            value={colorHex}
            onChange={(e) => onColor(e.target.value)}
            maxLength={7}
            spellCheck={false}
          />
        </div>
      </label>

      {/* Rotation */}
      <label className={styles.field}>
        <span className={styles.lbl}>{t('rotation')} (°)</span>
        <input
          type="number"
          className={styles.input}
          value={rotation}
          min={-180}
          max={180}
          onChange={(e) => onRotation(parseFloat(e.target.value) || 0)}
        />
      </label>

      {/* Font weight */}
      <label className={styles.field}>
        <span className={styles.lbl}>{t('fontWeight')}</span>
        <select
          className={styles.input}
          value={fontWeight}
          onChange={(e) => onFontWeight(parseInt(e.target.value))}
        >
          {WEIGHT_OPTIONS.map((w) => (
            <option key={w.value} value={w.value}>{w.label}</option>
          ))}
        </select>
      </label>

      {/* Font style (role only) */}
      {showFontStyle && (
        <label className={styles.field}>
          <span className={styles.lbl}>{t('fontStyle')}</span>
          <select
            className={styles.input}
            value={fontStyle}
            onChange={(e) => onFontStyle(e.target.value as 'normal' | 'italic')}
          >
            <option value="normal">{t('normal')}</option>
            <option value="italic">{t('italic')}</option>
          </select>
        </label>
      )}
    </div>
  )
}
