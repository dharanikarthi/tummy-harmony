import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Leaf, LayoutDashboard, Search, History, TrendingUp, User } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import ConditionBadge from './ConditionBadge';
import { useUser } from '@/context/UserContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/check', label: 'Check Food', icon: Search },
  { to: '/history', label: 'History', icon: History },
  { to: '/report', label: 'Weekly Report', icon: TrendingUp },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const { userName } = useUser();
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-card border-r border-border z-30 print:hidden">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center animate-heartbeat">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">GutSense</span>
      </div>

      {/* User */}
      <div className="px-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-good text-primary-foreground flex items-center justify-center font-bold text-sm shadow-[0_0_0_3px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_0_4px_hsl(var(--primary)/0.4)] transition-shadow duration-300">
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
          const active = location.pathname === l.to;
          return (
            <RouterNavLink
              key={l.label}
              to={l.to}
              className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary/10 text-primary border-l-4 border-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <l.icon className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              <span className="transition-transform duration-200 group-hover:translate-x-1">{l.label}</span>
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
