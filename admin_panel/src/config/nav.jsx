import {
  Headphones,
  LayoutDashboard,
  Megaphone,
  Settings,
  Spade,
  Store,
  Users,
} from 'lucide-react'

/** Main admin navigation — paths are absolute for React Router */
export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/cards', label: 'Cards', icon: Spade },
  { path: '/ad-manager', label: 'Ad Manager', icon: Megaphone },
  { path: '/shop', label: 'Shop', icon: Store },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/support', label: 'Customer Support', icon: Headphones },
]
