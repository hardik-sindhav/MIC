import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Accessible modal — Escape closes; backdrop click closes.
 * onClose kept in a ref so typing in forms does not re-run effects and steal focus.
 */
export function Modal({ open, title, description, onClose, children, footer }) {
  const titleId = useId()
  const descId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[3px] transition-opacity dark:bg-foreground/45"
        aria-label="Close dialog"
        onClick={() => onCloseRef.current()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="relative flex max-h-[min(92dvh,840px)] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-surface shadow-2xl dark:border-border-strong dark:bg-surface-elevated sm:max-h-[90vh] sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0 pt-0.5">
            <h2 id={titleId} className="font-display text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1 text-small text-foreground-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onCloseRef.current()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-border-strong"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <footer className="shrink-0 border-t border-border px-5 py-4 sm:px-6">{footer}</footer>
        ) : null}
      </div>
    </div>
  )
}
