import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lock, User, Menu, X } from 'lucide-react'
import { useAppStore } from '@/state/appStore'
import type { Locale } from '@/types'
import { HelpDialog } from '@/components/common/HelpDialog'
import { ShortcutsDialog } from '@/components/common/ShortcutsDialog'
import { PrivacyDialog } from '@/components/common/PrivacyDialog'
import styles from './TopBar.module.css'

interface Props {
  onMenuClick: () => void
  menuOpen:    boolean
}

export function TopBar({ onMenuClick, menuOpen }: Props) {
  const { t } = useTranslation()
  const locale    = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)

  const [showHelp,      setShowHelp]      = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showPrivacy,   setShowPrivacy]   = useState(false)

  return (
    <>
      <header className={styles.bar} role="banner">
        {/* Hamburger — tablet/mobile only */}
        <button
          className={[styles.menuBtn, menuOpen ? styles.menuBtnActive : ''].join(' ')}
          onClick={onMenuClick}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="sidebar"
        >
          {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>

        {/* Brand */}
        <span className={styles.brand} aria-label="PDF Batch Gen">
          PDF Batch Gen
        </span>

        {/* Nav links */}
        <nav className={styles.nav} aria-label="App navigation">
          <button
            className={styles.navBtn}
            onClick={() => setShowHelp(true)}
            aria-haspopup="dialog"
          >
            {t('help')}
          </button>
          <button
            className={styles.navBtn}
            onClick={() => setShowShortcuts(true)}
            aria-haspopup="dialog"
          >
            {t('shortcuts')}
          </button>
        </nav>

        <div className={styles.spacer} aria-hidden />

        {/* Language switcher */}
        <div className={styles.langSwitch} role="group" aria-label="Language">
          <LangBtn label="EN" locale="en" active={locale === 'en'} onSelect={setLocale} />
          <span className={styles.langSep} aria-hidden>/</span>
          <LangBtn label="AR" locale="ar" active={locale === 'ar'} onSelect={setLocale} />
        </div>

        {/* Privacy */}
        <button
          className={styles.iconBtn}
          onClick={() => setShowPrivacy(true)}
          title={t('localOnly')}
          aria-label={t('localOnly')}
          aria-haspopup="dialog"
        >
          <Lock size={18} aria-hidden />
        </button>

        {/* Avatar */}
        <div className={styles.avatar} aria-hidden>
          <User size={16} />
        </div>
      </header>

      {showHelp      && <HelpDialog      onClose={() => setShowHelp(false)} />}
      {showShortcuts && <ShortcutsDialog onClose={() => setShowShortcuts(false)} />}
      {showPrivacy   && <PrivacyDialog   onClose={() => setShowPrivacy(false)} />}
    </>
  )
}

function LangBtn({
  label, locale, active, onSelect,
}: {
  label: string; locale: Locale; active: boolean; onSelect: (l: Locale) => void
}) {
  return (
    <button
      className={`${styles.langBtn} ${active ? styles.langBtnActive : ''}`}
      onClick={() => onSelect(locale)}
      aria-pressed={active}
      aria-label={`Switch to ${label}`}
    >
      {label}
    </button>
  )
}
