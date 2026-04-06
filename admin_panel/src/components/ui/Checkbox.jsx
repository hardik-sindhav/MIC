import { forwardRef, useId } from 'react'

const box =
  'mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 rounded border-border-strong text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50'

/**
 * Accessible checkbox with optional visible label.
 */
export const Checkbox = forwardRef(function Checkbox(
  { id: idProp, label, className = '', disabled, ...props },
  ref
) {
  const uid = useId()
  const id = idProp ?? uid

  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <input ref={ref} id={id} type="checkbox" className={box} disabled={disabled} {...props} />
      {label ? (
        <label
          htmlFor={id}
          className={`text-small select-none text-foreground-muted ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          {label}
        </label>
      ) : null}
    </div>
  )
})
