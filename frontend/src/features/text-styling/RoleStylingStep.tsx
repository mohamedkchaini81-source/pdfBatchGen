import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/state/appStore'
import { StylingControls } from './StylingControls'
import { FontSlot } from '@/features/fonts/FontSlot'
import type { UploadedFont } from '@/types'

export function RoleStylingStep() {
  const { t }           = useTranslation()
  const field           = useAppStore((s) => s.roleField)
  const hasRoleColumn   = useAppStore((s) => s.hasRoleColumn)
  const setRoleFont     = useAppStore((s) => s.setRoleFont)
  const setMaxFontSize  = useAppStore((s) => s.setRoleMaxFontSize)
  const setColor        = useAppStore((s) => s.setRoleColor)
  const setRotation     = useAppStore((s) => s.setRoleRotation)
  const setFontWeight   = useAppStore((s) => s.setRoleFontWeight)
  const setFontStyle    = useAppStore((s) => s.setRoleFontStyle)

  if (!hasRoleColumn) {
    return (
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
        {t('csvNames')} — import a CSV with a <code>role</code> column to enable role configuration.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <FontSlot
        label={t('arabicFont')}
        hint={t('arabicFontNeeded')}
        font={field.arabicFont}
        lang="ar"
        onLoad={(f: UploadedFont) => setRoleFont('ar', f)}
        onRemove={() => setRoleFont('ar', null)}
      />
      <FontSlot
        label={t('englishFont')}
        hint={t('englishFontNeeded')}
        font={field.englishFont}
        lang="en"
        onLoad={(f: UploadedFont) => setRoleFont('en', f)}
        onRemove={() => setRoleFont('en', null)}
      />

      <StylingControls
        maxFontSize={field.maxFontSize}
        colorHex={field.colorHex}
        rotation={field.rotation}
        fontWeight={field.fontWeight}
        fontStyle={field.fontStyle}
        showFontStyle={true}
        onMaxFontSize={setMaxFontSize}
        onColor={setColor}
        onRotation={setRotation}
        onFontWeight={setFontWeight}
        onFontStyle={setFontStyle}
      />
    </div>
  )
}
