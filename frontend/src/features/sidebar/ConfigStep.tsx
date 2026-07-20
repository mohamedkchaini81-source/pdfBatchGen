import { type ReactNode, type ElementType } from 'react'
import styles from './ConfigStep.module.css'

interface Props {
  stepNumber: number
  title:      string
  subtitle:   string
  Icon:       ElementType
  isActive:   boolean
  isComplete: boolean
  onToggle:   () => void
  children:   ReactNode
}

/**
 * Accordion step — exact visual match to Flutter ConfigStep.
 * Active: purple header + white content card with shadow.
 * Complete (inactive): green ✓ dot.
 * Default: muted icon + grey dot.
 */
export function ConfigStep({
  stepNumber, title, subtitle, Icon,
  isActive, isComplete, onToggle, children,
}: Props) {
  return (
    <div
      className={[
        styles.wrap,
        isActive   ? styles.wrapActive : '',
      ].filter(Boolean).join(' ')}
    >
      {/* ── Header ── */}
      <button
        type="button"
        className={[
          styles.header,
          isActive ? styles.headerActive : '',
        ].filter(Boolean).join(' ')}
        onClick={onToggle}
        aria-expanded={isActive}
        aria-controls={`step-body-${stepNumber}`}
        id={`step-header-${stepNumber}`}
      >
        {/* Icon */}
        <span className={styles.iconWrap} aria-hidden>
          <Icon
            size={20}
            color={
              isActive    ? '#ffffff'
              : isComplete ? 'var(--color-success)'
              : 'var(--color-text-muted)'
            }
          />
        </span>

        {/* Text */}
        <span className={styles.textWrap}>
          <span className={styles.titleTxt}>{title}</span>
          <span className={styles.subtitleTxt}>{subtitle}</span>
        </span>

        {/* Step dot */}
        <span
          className={[
            styles.dot,
            isActive    ? styles.dotActive
            : isComplete ? styles.dotComplete
            : styles.dotDefault,
          ].filter(Boolean).join(' ')}
          aria-hidden
        >
          {isComplete && !isActive ? '✓' : stepNumber}
        </span>
      </button>

      {/* ── Body ── */}
      {isActive && (
        <div
          id={`step-body-${stepNumber}`}
          role="region"
          aria-labelledby={`step-header-${stepNumber}`}
          className={styles.body}
        >
          {children}
        </div>
      )}
    </div>
  )
}
