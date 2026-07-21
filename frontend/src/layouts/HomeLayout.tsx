import { useState } from 'react'
import styles from './HomeLayout.module.css'
import { TopBar } from '@/components/navigation/TopBar'
import { Sidebar } from '@/features/sidebar/Sidebar'
import { WorkspaceArea } from '@/features/workspace/WorkspaceArea'
import { BackendBanner } from '@/components/feedback/BackendBanner'

/**
 * Responsive shell.
 * - Desktop (≥1024px): sidebar always visible on the side
 * - Tablet/Mobile (<1024px): sidebar slides in as a drawer from a
 *   hamburger button in the TopBar; backdrop closes it on tap
 */
export function HomeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.shell}>
      <TopBar onMenuClick={() => setSidebarOpen((o) => !o)} menuOpen={sidebarOpen} />
      <BackendBanner />
      <div className={styles.body}>
        {/* Backdrop — mobile/tablet only */}
        {sidebarOpen && (
          <div
            className={styles.backdrop}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className={styles.main} id="main-content" tabIndex={-1}>
          <WorkspaceArea />
        </main>
      </div>
    </div>
  )
}
