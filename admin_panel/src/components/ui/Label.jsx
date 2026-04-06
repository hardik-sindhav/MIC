/**
 * Form label — mono / tracking for a technical admin UI.
 */
export function Label({ htmlFor, children, required, className = '', ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-0 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent ${className}`}
      {...props}
    >
      {children}
      {required ? <span className="sr-only"> (required)</span> : null}
      {required ? (
        <span className="ml-1 font-sans text-[0.65rem] font-normal normal-case tracking-normal text-error" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  )
}
