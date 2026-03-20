import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Leaf, LayoutDashboard, Search, History, Settings, TrendingUp } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import ConditionBadge from './ConditionBadge';
import { useUser } from '@/context/UserContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/check', label: 'Check Food', icon: Search },
  { to: '/history', label: 'History', icon: History },
  { to: '/report', label: 'Weekly Report', icon: TrendingUp },
  { to: '/dashboard', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { userName, gutCondition } = useUser();
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-card border-r border-border z-30">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">GutSense</span>
      </div>

      {/* User */}
      <div className="px-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{userName || 'User'}</p>
            <ConditionBadge />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((l) => {
          const active = location.pathname === l.to && l.label !== 'Settings';
          return (
            <RouterNavLink
              key={l.label}
              to={l.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary/10 text-primary border-l-4 border-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <l.icon className="w-5 h-5" />
              {l.label}
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-6 border-t border-border">
        <DarkModeToggle />
      </div>
    </aside>
  );
}
