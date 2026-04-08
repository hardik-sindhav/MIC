import { forwardRef, useId } from 'react'
import { Label } from './Label.jsx'

const fieldBase =
  'w-full min-h-[48px] rounded-xl border bg-surface px-4 py-3 text-body text-foreground transition-all duration-200 placeholder:text-foreground-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60 dark:bg-surface-elevated sm:min-h-[46px]'

/**
 * Multi-line textarea with optional label and error state.
 */
export const Textarea = forwardRef(function Textarea(
  {
    id: idProp,
    label,
    hint,
    error,
    className = '',
    required,
    rows = 3,
    ...props
  },
  ref
) {
  const uid = useId()
  const id = idProp ?? uid
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="w-full">
      {label ? (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      ) : null}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`${fieldBase} ${label ? 'mt-2' : ''} ${
          error
            ? 'border-error focus-visible:ring-error/40'
            : 'border-border hover:border-border-strong'
        } ${className} resize-none`}
        {...props}
      />
      {hint && !error ? (
        <p id={hintId} className="mt-2 text-small text-foreground-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-small text-error">
          {error}
        </p>
      ) : null}
    </div>
  )
})
