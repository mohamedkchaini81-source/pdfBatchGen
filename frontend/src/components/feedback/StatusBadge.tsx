import styles from './StatusBadge.module.css'

type Status = 'ok' | 'warning' | 'error' | 'idle'

interface Props {
  status:  Status
  label:   string
}

export function StatusBadge({ status, label }: Props) {
  return (
    <span className={[styles.badge, styles[status]].join(' ')} role="status">
      {label}
    </span>
  )
}
