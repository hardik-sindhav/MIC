import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Layers, Sparkles, TrendingDown, Trophy } from 'lucide-react'

const SLIDES = [
  {
    key: 'topWinners',
    title: 'Top winner players',
    subtitle: 'Highest match wins',
    metric: 'wins',
    metricLabel: 'Wins',
    Icon: Trophy,
    accent: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
    bg: 'bg-amber-500/15',
  },
  {
    key: 'topLosers',
    title: 'Top loser players',
    subtitle: 'Most losses on record',
    metric: 'losses',
    metricLabel: 'Losses',
    Icon: TrendingDown,
    accent: 'text-slate-600 dark:text-slate-300',
    ring: 'ring-slate-500/25',
    bg: 'bg-slate-500/12',
  },
  {
    key: 'topCardHolders',
    title: 'Top card holders',
    subtitle: 'Largest total collection',
    metric: 'cardsHeld',
    metricLabel: 'Cards',
    Icon: Layers,
    accent: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
    bg: 'bg-emerald-500/15',
  },
  {
    key: 'topRareCardHolders',
    title: 'Top rare card holders',
    subtitle: 'Most rare cards owned',
    metric: 'rareCardsHeld',
    metricLabel: 'Rare cards',
    Icon: Sparkles,
    accent: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-500/25',
    bg: 'bg-violet-500/15',
  },
]

function formatNum(n) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(n) || 0)
}

/** Home dashboard carousel with four leaderboard panels. */
export function TopPerformanceSlider({ loading, data }) {
  const [index, setIndex] = useState(0)
  const len = SLIDES.length

  const go = useCallback(
    (delta) => {
      setIndex((i) => (i + delta + len) % len)
    },
    [len],
  )

  useEffect(() => {
    if (!loading && data) setIndex(0)
  }, [loading, data])

  const slide = SLIDES[index]
  const list = data?.[slide.key] ?? []
  const Icon = slide.Icon

  return (
    <section
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm ring-1 ring-black/[0.03] dark:border-border-strong dark:bg-surface-elevated dark:ring-white/[0.05] sm:p-6"
      aria-labelledby="top-performance-heading"
      aria-roledescription="carousel"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="top-performance-heading"
            className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          >
            Top Performance
          </h2>
          <p className="mt-1 max-w-prose text-small text-foreground-muted">
            Home leaderboard — winners, losers, collections, and rare cards. Figures update when your app writes user
            stats (<span className="font-mono text-[11px]">wins</span>,{' '}
            <span className="font-mono text-[11px]">losses</span>,{' '}
            <span className="font-mono text-[11px]">cardsHeld</span>,{' '}
            <span className="font-mono text-[11px]">rareCardsHeld</span>).
          </p>
        </div>
        <div className="flex items-center gap-1 self-end sm:self-center">
          <button
            type="button"
            aria-label="Previous leaderboard"
            onClick={() => go(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-border-strong"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next leaderboard"
            onClick={() => go(1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-border-strong"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>

      <div
        className="mt-6 rounded-xl border border-border bg-surface-muted/40 p-4 dark:border-border-strong dark:bg-surface-muted/20 sm:p-5"
        role="group"
        aria-label={`${slide.title} — slide ${index + 1} of ${len}`}
      >
        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading leaderboards">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-muted dark:bg-surface-muted/60" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${slide.bg} ${slide.accent} ${slide.ring}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-semibold text-foreground">{slide.title}</h3>
                <p className="text-small text-foreground-muted">{slide.subtitle}</p>
              </div>
            </div>

            {list.length === 0 ? (
              <p className="mt-6 rounded-lg border border-dashed border-border bg-surface/80 px-4 py-8 text-center text-small text-foreground-muted dark:bg-surface-elevated/50">
                No players in this list yet. When users have a positive{' '}
                <span className="font-mono text-[11px] text-foreground-subtle">{slide.metric}</span> value, they appear
                here.
              </p>
            ) : (
              <ol className="mt-5 space-y-2">
                {list.map((row, rank) => (
                  <li
                    key={row.id}
                    className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface px-3 py-2.5 dark:border-border-strong dark:bg-surface-elevated/80"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted font-mono text-[11px] font-bold text-foreground-muted dark:bg-surface-muted/50">
                      {rank + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{row.displayName}</p>
                      <p className="truncate font-mono text-[11px] text-foreground-subtle">{row.email}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`font-display text-lg font-semibold tabular-nums ${slide.accent}`}>
                        {formatNum(row[slide.metric])}
                      </p>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-foreground-subtle">
                        {slide.metricLabel}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>

      <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Choose leaderboard">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={s.title}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-8 bg-accent' : 'w-2 bg-foreground/20 hover:bg-foreground/35'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
