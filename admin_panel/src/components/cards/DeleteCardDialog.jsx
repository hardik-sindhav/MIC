import { useEffect, useRef } from 'react'
import { Archive, X } from 'lucide-react'
import { Button } from '../ui/Button.jsx'

/**
 * Archive confirmation — matches main Modal shell / catalog styling.
 */
export function DeleteCardDialog({ open, card, onClose, onConfirm, loading }) {
  const onCloseRef = useRef(onClose)
  const onConfirmRef = useRef(onConfirm)
  onCloseRef.current = onClose
  onConfirmRef.current = onConfirm

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, loading])

  if (!open || !card) return null

  const name = card.name || 'this card'

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[3px] dark:bg-foreground/50"
        style={{ animation: 'mic-delete-backdrop-in 0.2s ease-out both' }}
        aria-label="Close"
        onClick={() => !loading && onCloseRef.current()}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="archive-dialog-title"
        aria-describedby="archive-dialog-desc"
        className="relative flex max-h-[min(90dvh,560px)] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-surface shadow-2xl dark:border-border-strong dark:bg-surface-elevated sm:rounded-2xl"
        style={{ animation: 'mic-delete-panel-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both' }}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0 pt-0.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted/60 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground-muted dark:bg-surface-muted/30">
              <Archive className="h-3.5 w-3.5 text-accent" strokeWidth={2} aria-hidden />
              Archive
            </div>
            <h2
              id="archive-dialog-title"
              className="mt-3 font-display text-xl font-semibold tracking-tight text-foreground"
            >
              Remove from catalog?
            </h2>
            <p id="archive-dialog-desc" className="mt-1 text-small text-foreground-muted">
              The card stays in <span className="font-medium text-foreground">Recently deleted</span> until you
              restore or replace it. You can bring it back in one tap.
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => onCloseRef.current()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-50 dark:border-border-strong"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            {card.image ? (
              <div className="relative mx-auto h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl border border-border bg-surface-muted shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.08] sm:mx-0 sm:h-20 sm:w-20">
                <img src={card.image} alt="" className="h-full w-full object-cover" />
              </div>
            ) : null}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="font-display text-[17px] font-semibold leading-snug text-foreground line-clamp-2">
                {name}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground-muted">
                It will disappear from the main table above and appear under{' '}
                <span className="text-foreground">Recently deleted</span> with a timestamp.
              </p>
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-border px-5 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={loading}
              onClick={() => onCloseRef.current()}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              className="w-full sm:w-auto"
              loading={loading}
              disabled={loading}
              onClick={() => onConfirmRef.current()}
            >
              Archive card
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}
