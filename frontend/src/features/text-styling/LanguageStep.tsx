import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/state/appStore'
import type { TextMode } from '@/types'
import styles from './LanguageStep.module.css'

const OPTIONS: { value: TextMode; labelKey: string; descKey: string }[] = [
  { value: 'auto', labelKey: 'auto',         descKey: 'autoDetect'   },
  { value: 'ar',   labelKey: 'ar',           descKey: 'forceArabic'  },
  { value: 'en',   labelKey: 'en',           descKey: 'forceEnglish' },
]

export function LanguageStep() {
  const { t }       = useTranslation()
  const textMode    = useAppStore((s) => s.textMode)
  const setTextMode = useAppStore((s) => s.setTextMode)

  return (
    <div className={styles.wrap}>
      <p className={styles.note}>{t('separateUi')}</p>
      <div className={styles.options} role="radiogroup" aria-label={t('textMode')}>
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={[styles.option, textMode === opt.value ? styles.optionActive : ''].join(' ')}
          >
            <input
              type="radio"
              name="textMode"
              value={opt.value}
              checked={textMode === opt.value}
              onChange={() => setTextMode(opt.value)}
              className="sr-only"
            />
            <span className={styles.optLabel}>{t(opt.labelKey)}</span>
            <span className={styles.optDesc}>{t(opt.descKey)}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
