import { useCallback, useEffect, useState } from 'react'
import { MessageSquare, Spade, Users } from 'lucide-react'
import { toast } from 'sonner'
import { fetchDashboardStats, fetchTopPerformance } from '../api/stats.js'
import { TopPerformanceSlider } from '../components/dashboard/TopPerformanceSlider.jsx'
import { SectionHeader } from '../components/layout/SectionHeader.jsx'
import { useAuth } from '../hooks/useAuth.js'

const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })

const statCards = [
  {
    key: 'totalUsers',
    label: 'App users',
    hint: 'Registered customer accounts (admins excluded)',
    icon: Users,
    iconWrap: 'bg-accent/15 text-accent ring-accent/20',
    glow: 'from-accent/[0.12] dark:from-accent/[0.08]',
  },
  {
    key: 'totalCards',
    label: 'Cards',
    hint: 'Playing cards in catalog',
    icon: Spade,
    iconWrap:
      'bg-emerald-500/15 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-400/25',
    glow: 'from-emerald-500/[0.12] dark:from-emerald-400/[0.08]',
  },
  {
    key: 'openTickets',
    label: 'Open tickets',
    hint: 'Support tickets awaiting action',
    icon: MessageSquare,
    iconWrap:
      'bg-amber-500/15 text-amber-600 ring-amber-500/25 dark:text-amber-400 dark:ring-amber-400/25',
    glow: 'from-amber-500/[0.12] dark:from-amber-400/[0.08]',
  },
]

export function DashboardPage() {
  const { accessToken } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [topLoading, setTopLoading] = useState(true)
  const [topPerformance, setTopPerformance] = useState(null)

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false)
      setTopLoading(false)
      setTopPerformance(null)
      return
    }
    setLoading(true)
    setTopLoading(true)

    const [dashRes, topRes] = await Promise.allSettled([
      fetchDashboardStats(accessToken),
      fetchTopPerformance(accessToken, { limit: 8 }),
    ])

    if (dashRes.status === 'fulfilled') {
      const data = dashRes.value
      setStats({
        totalUsers: Number(data.totalUsers) || 0,
        totalCards: Number(data.totalCards) || 0,
        openTickets: Number(data.openTickets) || 0,
      })
    } else {
      toast.error(dashRes.reason?.message || 'Could not load dashboard statistics.')
      setStats({
        totalUsers: 0,
        totalCards: 0,
        openTickets: 0,
      })
    }

    if (topRes.status === 'fulfilled') {
      setTopPerformance(topRes.value)
    } else {
      setTopPerformance(null)
      if (dashRes.status === 'fulfilled') {
        toast.error(topRes.reason?.message || 'Could not load top performance.')
      }
    }

    setLoading(false)
    setTopLoading(false)
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <SectionHeader
        title="Dashboard"
        description="Live counts from your MIC database. Totals update each time you open this page."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map(
          ({ key, label, hint, icon: Icon, iconWrap, glow }) => (
            <div
              key={key}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm ring-1 ring-black/[0.02] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-border-strong dark:bg-surface-elevated dark:ring-white/[0.04] sm:p-6"
            >
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${glow} to-transparent opacity-90 transition-opacity group-hover:opacity-100`}
                aria-hidden
              />
              <div className="relative flex gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${iconWrap}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-foreground-subtle">
                    {label}
                  </p>
                  <p className="mt-1.5 font-display text-3xl font-semibold tabular-nums tracking-tight text-foreground sm:text-4xl">
                    {loading ? (
                      <span className="inline-block h-9 w-20 animate-pulse rounded-lg bg-surface-muted dark:bg-surface-muted/80" />
                    ) : (
                      fmt.format(stats?.[key] ?? 0)
                    )}
                  </p>
                  <p className="mt-2 text-small leading-snug text-foreground-subtle">
                    {hint}
                  </p>
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      <div className="mt-10">
        <TopPerformanceSlider loading={topLoading} data={topPerformance} />
      </div>
    </>
  )
}
