import styles from './HomeLayout.module.css'
import { TopBar } from '@/components/navigation/TopBar'
import { Sidebar } from '@/features/sidebar/Sidebar'
import { WorkspaceArea } from '@/features/workspace/WorkspaceArea'
import { BackendBanner } from '@/components/feedback/BackendBanner'

export function HomeLayout() {
  return (
    <div className={styles.shell}>
      <TopBar />
      <BackendBanner />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main} id="main-content" tabIndex={-1}>
          <WorkspaceArea />
        </main>
      </div>
    </div>
  )
}
