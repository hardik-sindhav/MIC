import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { SidebarNav } from '../components/layout/SidebarNav.jsx'
import { ThemeToggle } from '../components/ui/ThemeToggle.jsx'
import { useAuth } from '../hooks/useAuth.js'

/**
 * Responsive shell: drawer sidebar on mobile/tablet, fixed sidebar on lg+.
 */
export function DashboardLayout({ theme, onToggleTheme }) {
  const { logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  return (
    <div className="flex min-h-dvh bg-surface-muted text-foreground transition-colors duration-theme">
      {/* Mobile / tablet overlay */}
      <button
        type="button"
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileOpen}
        className={`fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        id="admin-sidebar"
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[min(19rem,calc(100vw-3rem))] max-w-full flex-col border-r border-border bg-surface shadow-xl transition-transform duration-300 ease-out dark:bg-surface-elevated dark:shadow-black/40',
          'lg:static lg:z-0 lg:min-h-dvh lg:w-64 lg:shrink-0 lg:shadow-none xl:w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        aria-hidden={!mobileOpen ? undefined : undefined}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4 lg:h-16 lg:px-5">
          <Link
            to="/dashboard"
            className="flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            onClick={() => setMobileOpen(false)}
          >
            <span
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-elevated font-mono text-small font-semibold text-accent ring-1 ring-accent/25 dark:bg-surface-muted"
              aria-hidden
            >
              M
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgb(var(--color-accent)/0.85)]" />
            </span>
            <div className="min-w-0">
              <div className="font-display text-heading-md leading-tight tracking-tight text-foreground">MIC</div>
              <div className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-accent">
                Console
              </div>
            </div>
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <SidebarNav onNavigate={() => setMobileOpen(false)} />

        <div className="mt-auto shrink-0 border-t border-border px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-foreground-subtle lg:px-5">
          MIC Admin · v1
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:h-16 sm:px-5 lg:px-6">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 lg:hidden dark:bg-surface-elevated"
            onClick={() => setMobileOpen(true)}
            aria-controls="admin-sidebar"
            aria-expanded={mobileOpen}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <div className="min-w-0 flex-1 lg:pl-0">
            <p className="truncate font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-foreground-subtle">
              Control center
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground-muted transition-colors hover:border-accent/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:hidden dark:bg-surface-elevated"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="hidden rounded-lg border border-border bg-surface px-3 py-2 text-small font-medium text-foreground-muted transition-colors hover:border-accent/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:inline-flex dark:bg-surface-elevated"
            >
              Sign out
            </button>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
