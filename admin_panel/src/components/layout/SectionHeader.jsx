export function SectionHeader({ title, description, className = '' }) {
  return (
    <header className={['mb-8', className].filter(Boolean).join(' ')}>
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-body leading-relaxed text-foreground-muted">{description}</p>
      ) : null}
    </header>
  )
}
