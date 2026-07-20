import { useAppStore } from '@/state/appStore'
import { WorkspaceToolbar } from './WorkspaceToolbar'
import { PdfCanvas } from '@/features/pdf-preview/PdfCanvas'
import { EmptyState } from './EmptyState'
import { WorkspaceFooter } from './WorkspaceFooter'
import styles from './WorkspaceArea.module.css'

/**
 * Main workspace: Toolbar → PDF canvas (with ruler overlays) → Footer
 * Mirrors Flutter Workspace widget.
 */
export function WorkspaceArea() {
  const hasPdf = useAppStore((s) => s.templateFile !== null)

  return (
    <div className={styles.wrap}>
      <WorkspaceToolbar />
      <div className={styles.canvas}>
        {hasPdf ? <PdfCanvas /> : <EmptyState />}
      </div>
      <WorkspaceFooter />
    </div>
  )
}
