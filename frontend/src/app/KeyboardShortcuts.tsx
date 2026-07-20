import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAppStore } from '@/state/appStore'
import { ValidationDialog } from '@/features/validation/ValidationDialog'
import { HelpDialog } from '@/components/common/HelpDialog'
import { ShortcutsDialog } from '@/components/common/ShortcutsDialog'

interface Props { children: ReactNode }

/**
 * Global keyboard shortcut handler.
 * Mirrors Flutter _HomeShortcuts exactly.
 *
 * Ctrl+Enter  → open validation/export dialog
 * Ctrl+O      → trigger PDF file open (dispatched to TemplateUpload)
 * Ctrl+Shift+O → trigger CSV open
 * Ctrl+=      → zoom in
 * Ctrl+-      → zoom out
 * Shift+?     → open help dialog
 * Escape      → close top dialog (handled by individual dialogs)
 */
export function KeyboardShortcuts({ children }: Props) {
  const zoomIn  = useAppStore((s) => s.zoomIn)
  const zoomOut = useAppStore((s) => s.zoomOut)

  const [showValidation, setShowValidation] = useState(false)
  const [showHelp,       setShowHelp]       = useState(false)
  const [showShortcuts,  setShowShortcuts]  = useState(false)

  // Refs so the keydown closure always reads the latest values
  const showValRef  = useRef(showValidation)
  showValRef.current = showValidation

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      const inInput = tag === 'input' || tag === 'textarea' || tag === 'select'

      // Ctrl/Cmd + Enter → validation dialog
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        setShowValidation(true)
        return
      }

      // Ctrl + = → zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        zoomIn()
        return
      }

      // Ctrl + - → zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        zoomOut()
        return
      }

      // Shift + ? → help
      if (e.shiftKey && e.key === '?' && !inInput) {
        e.preventDefault()
        setShowHelp(true)
        return
      }

      // Ctrl+O → emit custom event (picked up by TemplateUpload)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'o' && !inInput) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('shortcut:openPdf'))
        return
      }

      // Ctrl+Shift+O → emit custom event (picked up by CsvImport)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O' && !inInput) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('shortcut:openCsv'))
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [zoomIn, zoomOut])

  return (
    <>
      {children}
      {showValidation && (
        <ValidationDialog onClose={() => setShowValidation(false)} />
      )}
      {showHelp && (
        <HelpDialog onClose={() => setShowHelp(false)} />
      )}
      {showShortcuts && (
        <ShortcutsDialog onClose={() => setShowShortcuts(false)} />
      )}
    </>
  )
}
