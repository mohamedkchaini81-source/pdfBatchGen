import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/state/appStore'
import type { UploadedFont } from '@/types'
import { FontSlot } from './FontSlot'
import styles from './FontsStep.module.css'

/**
 * Step 3 — Load name fonts (AR + EN).
 * Role fonts are in RoleStylingStep for cleaner separation.
 */
export function FontsStep() {
  const { t } = useTranslation()
  const arabicFont  = useAppStore((s) => s.nameField.arabicFont)
  const englishFont = useAppStore((s) => s.nameField.englishFont)
  const setNameFont = useAppStore((s) => s.setNameFont)

  return (
    <div className={styles.wrap}>
      <p className={styles.note}>{t('ttfOtf')}</p>

      <FontSlot
        label={t('arabicFont')}
        hint={t('arabicFontNeeded')}
        font={arabicFont}
        lang="ar"
        onLoad={(font: UploadedFont) => setNameFont('ar', font)}
        onRemove={() => setNameFont('ar', null)}
      />

      <FontSlot
        label={t('englishFont')}
        hint={t('englishFontNeeded')}
        font={englishFont}
        lang="en"
        onLoad={(font: UploadedFont) => setNameFont('en', font)}
        onRemove={() => setNameFont('en', null)}
      />
    </div>
  )
}
