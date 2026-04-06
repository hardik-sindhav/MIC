import { useEffect, useRef } from 'react'
import { Trash2, X } from 'lucide-react'
import { Button } from '../ui/Button.jsx'

export function DeleteShopCheatDialog({ open, item, onClose, onConfirm, loading }) {
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

  if (!open || !item) return null

  const label = item.name || 'this item'

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[3px] dark:bg-foreground/50"
        aria-label="Close"
        onClick={() => !loading && onCloseRef.current()}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-shop-title"
        aria-describedby="delete-shop-desc"
        className="relative flex max-h-[min(90dvh,480px)] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-surface shadow-2xl dark:border-border-strong dark:bg-surface-elevated sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0 pt-0.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted/60 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground-muted dark:bg-surface-muted/30">
              <Trash2 className="h-3.5 w-3.5 text-error" strokeWidth={2} aria-hidden />
              Delete
            </div>
            <h2
              id="delete-shop-title"
              className="mt-3 font-display text-xl font-semibold tracking-tight text-foreground"
            >
              Remove treasure chest?
            </h2>
            <p id="delete-shop-desc" className="mt-1 text-small text-foreground-muted">
              <span className="font-medium text-foreground">{label}</span> will be permanently removed from the shop.
              This cannot be undone.
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

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" variant="secondary" className="w-full sm:w-auto" disabled={loading} onClick={() => onCloseRef.current()}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full border-error/50 text-error hover:border-error hover:bg-error/10 sm:w-auto"
            loading={loading}
            disabled={loading}
            onClick={() => onConfirmRef.current()}
          >
            Delete
          </Button>
        </footer>
      </div>
    </div>
  )
}
