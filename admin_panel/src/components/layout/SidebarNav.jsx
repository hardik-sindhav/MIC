import { NavLink, useMatch } from 'react-router-dom'
import { NAV_ITEMS } from '../../config/nav.jsx'

function NavItem(props) {
  const { path, label, onNavigate } = props
  const Icon = props.icon
  const match = useMatch({ path, end: path === '/dashboard' })
  const isActive = Boolean(match)

  return (
    <NavLink
      to={path}
      onClick={() => onNavigate?.()}
      className={[
        'flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-small font-medium transition-colors',
        'outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        isActive
          ? 'bg-accent/15 text-accent'
          : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
      ].join(' ')}
    >
      <Icon
        className={`h-5 w-5 shrink-0 ${isActive ? 'text-accent' : 'opacity-80'}`}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

export function SidebarNav({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3" aria-label="Main">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.path} {...item} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}
