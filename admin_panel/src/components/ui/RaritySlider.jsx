/**
 * Rarity 0–100: range + numeric readout.
 */
export function RaritySlider({ id, label, value, onChange, error, required }) {
  const v = Math.min(100, Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0))

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={id}
          className="mb-0 block font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent"
        >
          {label}
          {required ? (
            <span
              className="ml-1 font-sans text-[0.65rem] font-normal normal-case tracking-normal text-error"
              aria-hidden
            >
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div
        className={`mt-3 rounded-xl border bg-surface px-4 py-4 dark:bg-surface-elevated ${error ? 'border-error' : 'border-border'}`}
      >
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-small text-foreground-subtle">How rare (0 = common, 100 = mythic)</span>
          <span className="font-mono text-lg font-semibold tabular-nums text-accent">{v}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-6 shrink-0 text-center font-mono text-[11px] text-foreground-subtle">0</span>
          <input
            id={id}
            type="range"
            min={0}
            max={100}
            step={1}
            value={v}
            onChange={(e) => onChange(Number(e.target.value))}
            className="mic-star-range h-2 w-full flex-1 cursor-pointer appearance-none rounded-full bg-surface-muted accent-accent dark:bg-surface-muted/80"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={v}
            aria-valuetext={`Rarity ${v} of 100`}
          />
          <span className="w-8 shrink-0 text-center font-mono text-[11px] text-foreground-subtle">100</span>
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
