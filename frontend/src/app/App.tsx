import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/state/appStore'
import { HomeLayout } from '@/layouts/HomeLayout'
import { KeyboardShortcuts } from './KeyboardShortcuts'

/**
 * Root application component.
 * Handles locale ↔ i18n sync and html[lang/dir] updates.
 */
export function App() {
  const locale = useAppStore((s) => s.locale)
  const { i18n } = useTranslation()

  useEffect(() => {
    i18n.changeLanguage(locale)
    const html = document.documentElement
    html.setAttribute('lang', locale)
    html.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr')
  }, [locale, i18n])

  return (
    <KeyboardShortcuts>
      <HomeLayout />
    </KeyboardShortcuts>
  )
}
