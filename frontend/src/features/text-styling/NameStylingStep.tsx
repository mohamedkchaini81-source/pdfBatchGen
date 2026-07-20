import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/state/appStore'
import { StylingControls } from './StylingControls'
import { FontSlot } from '@/features/fonts/FontSlot'
import type { UploadedFont } from '@/types'

export function NameStylingStep() {
  const { t }          = useTranslation()
  const field          = useAppStore((s) => s.nameField)
  const setNameFont    = useAppStore((s) => s.setNameFont)
  const setMaxFontSize = useAppStore((s) => s.setNameMaxFontSize)
  const setColor       = useAppStore((s) => s.setNameColor)
  const setRotation    = useAppStore((s) => s.setNameRotation)
  const setFontWeight  = useAppStore((s) => s.setNameFontWeight)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Fonts inline for name step */}
      <FontSlot
        label={t('arabicFont')}
        hint={t('arabicFontNeeded')}
        font={field.arabicFont}
        lang="ar"
        onLoad={(f: UploadedFont) => setNameFont('ar', f)}
        onRemove={() => setNameFont('ar', null)}
      />
      <FontSlot
        label={t('englishFont')}
        hint={t('englishFontNeeded')}
        font={field.englishFont}
        lang="en"
        onLoad={(f: UploadedFont) => setNameFont('en', f)}
        onRemove={() => setNameFont('en', null)}
      />

      <StylingControls
        maxFontSize={field.maxFontSize}
        colorHex={field.colorHex}
        rotation={field.rotation}
        fontWeight={field.fontWeight}
        fontStyle="normal"
        showFontStyle={false}
        onMaxFontSize={setMaxFontSize}
        onColor={setColor}
        onRotation={setRotation}
        onFontWeight={setFontWeight}
        onFontStyle={() => {}}
      />
    </div>
  )
}
