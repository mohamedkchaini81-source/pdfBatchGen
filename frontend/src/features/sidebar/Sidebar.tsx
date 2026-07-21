import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/state/appStore'
import { selectValidation } from '@/state/selectors'
import { ConfigStep } from './ConfigStep'
import { TemplateUploadStep } from '@/features/template-upload/TemplateUploadStep'
import { LanguageStep } from '@/features/text-styling/LanguageStep'
import { FontsStep } from '@/features/fonts/FontsStep'
import { CsvImportStep } from '@/features/csv-import/CsvImportStep'
import { NameStylingStep } from '@/features/text-styling/NameStylingStep'
import { RoleStylingStep } from '@/features/text-styling/RoleStylingStep'
import { ExportStep } from '@/features/export/ExportStep'
import { SidebarFooter } from './SidebarFooter'
import styles from './Sidebar.module.css'
import {
  FileText, Languages, Type, Table2,
  AlignCenter, Briefcase, Download,
} from 'lucide-react'

interface Props {
  isOpen:  boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: Props) {
  const [active, setActive] = useState(0)
  const { t } = useTranslation()

  const hasPdf       = useAppStore((s) => s.templateFile !== null)
  const hasRecords   = useAppStore((s) => s.records.length > 0)
  const hasNameFonts = useAppStore((s) =>
    s.nameField.arabicFont !== null || s.nameField.englishFont !== null
  )
  const hasRoleCol   = useAppStore((s) => s.hasRoleColumn)
  const state        = useAppStore()
  const validation   = selectValidation(state)

  const toggle = (i: number) => setActive((prev) => (prev === i ? -1 : i))

  const steps = [
    {
      icon: FileText,
      titleKey: 'steps.pdf',
      subtitleKey: 'stepSubtitles.pdf',
      complete: hasPdf,
      content: <TemplateUploadStep />,
    },
    {
      icon: Languages,
      titleKey: 'steps.language',
      subtitleKey: 'stepSubtitles.language',
      complete: true,
      content: <LanguageStep />,
    },
    {
      icon: Type,
      titleKey: 'steps.fonts',
      subtitleKey: 'stepSubtitles.fonts',
      complete: hasNameFonts,
      content: <FontsStep />,
    },
    {
      icon: Table2,
      titleKey: 'steps.csv',
      subtitleKey: 'stepSubtitles.csv',
      complete: hasRecords,
      content: <CsvImportStep />,
    },
    {
      icon: AlignCenter,
      titleKey: 'steps.name',
      subtitleKey: 'stepSubtitles.name',
      complete: hasPdf && !validation.errors.some((e) => e.key === 'invalidBox'),
      content: <NameStylingStep />,
    },
    {
      icon: Briefcase,
      titleKey: 'steps.role',
      subtitleKey: 'stepSubtitles.role',
      complete: !hasRoleCol || (hasPdf && !validation.errors.some((e) => e.key === 'invalidRoleBox')),
      content: <RoleStylingStep />,
    },
    {
      icon: Download,
      titleKey: 'steps.export',
      subtitleKey: 'stepSubtitles.export',
      complete: false,
      content: <ExportStep />,
    },
  ]

  return (
    <aside
      id="sidebar"
      className={[styles.sidebar, isOpen ? styles.open : ''].join(' ')}
      aria-label={t('configuration')}
    >
      <div className={styles.scrollArea}>
        {steps.map((step, i) => (
          <ConfigStep
            key={i}
            stepNumber={i + 1}
            title={t(step.titleKey)}
            subtitle={t(step.subtitleKey)}
            Icon={step.icon}
            isActive={active === i}
            isComplete={step.complete}
            onToggle={() => toggle(i)}
          >
            {step.content}
          </ConfigStep>
        ))}
      </div>
      <SidebarFooter onAfterGenerate={onClose} />
    </aside>
  )
}
