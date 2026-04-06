/**
 * Loading spinner; uses accent in default theme.
 */
export function Loader({ className = '', size = 'md', label = 'Loading', decorative = false }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-10 w-10 border-[3px]',
  }

  const cls = `inline-block shrink-0 rounded-full border-accent/25 border-t-accent motion-safe:animate-spin ${sizes[size]} ${className}`

  if (decorative) {
    return <span className={cls} aria-hidden="true" />
  }

  return (
    <span role="status" aria-live="polite" aria-label={label} className={cls} />
  )
}
