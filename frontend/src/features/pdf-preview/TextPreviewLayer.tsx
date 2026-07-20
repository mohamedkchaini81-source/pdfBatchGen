import { useMemo } from 'react'
import { useAppStore } from '@/state/appStore'
import { textLanguage } from '@/utils/arabic'
import { combinedRuler, rulerToPx } from '@/utils/ruler'
import { computeFittedSize } from '@/utils/textFit'
import styles from './TextPreviewLayer.module.css'

interface Props {
  containerW: number
  containerH: number
}

/**
 * Text preview layer drawn on top of the PDF canvas.
 * Shows the current participant's name and role at the fitted font size,
 * positioned inside the ruler boxes.
 *
 * Uses the same binary-search fitting as the Python backend.
 * Arabic text is rendered RTL using CSS direction — reshaping is
 * handled server-side for the actual export.
 */
export function TextPreviewLayer({ containerW, containerH }: Props) {
  const records     = useAppStore((s) => s.records)
  const recordIndex = useAppStore((s) => s.recordIndex)
  const nameField   = useAppStore((s) => s.nameField)
  const roleField   = useAppStore((s) => s.roleField)
  const textMode    = useAppStore((s) => s.textMode)
  const hasRole     = useAppStore((s) => s.hasRoleColumn)

  const record = records[recordIndex] ?? null
  const name   = record?.name ?? 'Name / الاسم'
  const role   = record?.role ?? ''

  // Effective name ruler: expand when role column exists but role is empty
  const effectiveNameRuler = useMemo(() => {
    if (hasRole && role === '' && record !== null) {
      return combinedRuler(nameField.ruler, roleField.ruler)
    }
    return nameField.ruler
  }, [hasRole, role, record, nameField.ruler, roleField.ruler])

  const nameLang    = textLanguage(name, textMode)
  const nameFontFam = nameLang === 'ar'
    ? (nameField.arabicFont ? 'UserFont-ar' : 'IBM Plex Sans Arabic')
    : (nameField.englishFont ? 'UserFont-en' : 'Inter')

  const roleLang    = role ? textLanguage(role, textMode) : 'en'
  const roleFontFam = roleLang === 'ar'
    ? (roleField.arabicFont ? 'UserFont-ar-role' : 'IBM Plex Sans Arabic')
    : (roleField.englishFont ? 'UserFont-en-role' : 'Inter')

  // Compute PDF point dimensions for the ruler boxes
  const pageW = useAppStore((s) => s.pageWidth)
  const pageH = useAppStore((s) => s.pageHeight)

  const nameBoxPt = {
    w: (effectiveNameRuler.right - effectiveNameRuler.left) * pageW,
    h: (effectiveNameRuler.bottom - effectiveNameRuler.top) * pageH,
  }
  const roleBoxPt = {
    w: (roleField.ruler.right - roleField.ruler.left) * pageW,
    h: (roleField.ruler.bottom - roleField.ruler.top) * pageH,
  }

  const nameFitSize = computeFittedSize({
    text:        name,
    fontFamily:  nameFontFam,
    fontWeight:  nameField.fontWeight,
    fontStyle:   'normal',
    boxW:        nameBoxPt.w,
    boxH:        nameBoxPt.h,
    maxFontSize: nameField.maxFontSize,
    rotation:    nameField.rotation,
  })

  const roleFitSize = role ? computeFittedSize({
    text:        role,
    fontFamily:  roleFontFam,
    fontWeight:  roleField.fontWeight,
    fontStyle:   roleField.fontStyle,
    boxW:        roleBoxPt.w,
    boxH:        roleBoxPt.h,
    maxFontSize: roleField.maxFontSize,
    rotation:    roleField.rotation,
  }) : 0

  // Scale factor: container px / page points
  const scaleX = containerW / pageW

  const nameRect = rulerToPx(effectiveNameRuler, containerW, containerH)
  const roleRect = rulerToPx(roleField.ruler,    containerW, containerH)

  return (
    <div className={styles.layer} aria-hidden>
      {/* Name */}
      <TextBlock
        text={name}
        rect={nameRect}
        fontSize={nameFitSize * scaleX}
        fontFamily={nameFontFam}
        fontWeight={nameField.fontWeight}
        fontStyle="normal"
        color={nameField.colorHex}
        rotation={nameField.rotation}
        isArabic={nameLang === 'ar'}
      />

      {/* Role */}
      {hasRole && role && (
        <TextBlock
          text={role}
          rect={roleRect}
          fontSize={roleFitSize * scaleX}
          fontFamily={roleFontFam}
          fontWeight={roleField.fontWeight}
          fontStyle={roleField.fontStyle}
          color={roleField.colorHex}
          rotation={roleField.rotation}
          isArabic={roleLang === 'ar'}
        />
      )}
    </div>
  )
}

function TextBlock({
  text, rect, fontSize, fontFamily, fontWeight, fontStyle, color, rotation, isArabic,
}: {
  text:       string
  rect:       { x: number; y: number; width: number; height: number }
  fontSize:   number
  fontFamily: string
  fontWeight: number
  fontStyle:  'normal' | 'italic'
  color:      string
  rotation:   number
  isArabic:   boolean
}) {
  return (
    <div
      style={{
        position:        'absolute',
        left:            rect.x,
        top:             rect.y,
        width:           rect.width,
        height:          rect.height,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        overflow:        'hidden',
        pointerEvents:   'none',
      }}
    >
      <span
        style={{
          fontSize:     `${fontSize}px`,
          fontFamily,
          fontWeight,
          fontStyle,
          color,
          direction:    isArabic ? 'rtl' : 'ltr',
          textAlign:    'center',
          whiteSpace:   'nowrap',
          transform:    rotation ? `rotate(${rotation}deg)` : undefined,
          lineHeight:   1.2,
          maxWidth:     '100%',
        }}
      >
        {text}
      </span>
    </div>
  )
}
