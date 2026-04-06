/**
 * Panel with optional top accent — used for auth and dashboards.
 */
export function Card({ children, className = '', accentTop = false, ...props }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_48px_-16px_rgb(0_0_0/0.12)] dark:border-border-strong dark:bg-surface-elevated dark:shadow-[0_24px_56px_-12px_rgb(0_0_0/0.65)] ${className}`}
      {...props}
    >
      {accentTop ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-80"
          aria-hidden="true"
        />
      ) : null}
      <div className={accentTop ? 'relative p-8 sm:p-9' : 'p-6 sm:p-8'}>{children}</div>
    </div>
  )
}
