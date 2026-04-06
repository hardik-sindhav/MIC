import { Star } from 'lucide-react'

/**
 * 1–5 stars: visual row + range input for keyboard / fine control.
 */
export function StarSlider({ id, label, value, onChange, error, required }) {
  const v = Math.min(5, Math.max(1, Number(value) || 1))

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={id}
          className="mb-0 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent"
        >
          {label}
          {required ? (
            <span className="ml-1 font-sans text-[0.65rem] font-normal normal-case tracking-normal text-error" aria-hidden>
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div className={`mt-3 rounded-xl border bg-surface px-4 py-4 dark:bg-surface-elevated ${error ? 'border-error' : 'border-border'}`}>
        <div className="mb-3 flex items-center justify-center gap-1 sm:justify-start" aria-hidden>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className="rounded-lg p-1 text-accent transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              aria-label={`${n} stars`}
            >
              <Star
                className={`h-8 w-8 sm:h-7 sm:w-7 ${n <= v ? 'fill-accent text-accent' : 'fill-transparent text-foreground-subtle/40'}`}
                strokeWidth={n <= v ? 0 : 1.5}
              />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            id={id}
            type="range"
            min={1}
            max={5}
            step={1}
            value={v}
            onChange={(e) => onChange(Number(e.target.value))}
            className="mic-star-range h-2 w-full flex-1 cursor-pointer appearance-none rounded-full bg-surface-muted accent-accent dark:bg-surface-muted/80"
            aria-valuemin={1}
            aria-valuemax={5}
            aria-valuenow={v}
            aria-valuetext={`${v} stars`}
          />
          <span className="w-8 shrink-0 text-center font-mono text-small font-semibold tabular-nums text-foreground">
            {v}
          </span>
        </div>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-small text-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}
