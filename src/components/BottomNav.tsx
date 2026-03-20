import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search, History, User } from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/check', label: 'Check', icon: Search },
  { to: '/history', label: 'History', icon: History },
  { to: '/dashboard', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const active = location.pathname === item.to && item.label !== 'Profile';
          return (
            <NavLink key={item.label} to={item.to} className="flex flex-col items-center gap-0.5 px-3 py-1">
              <item.icon className={`w-5 h-5 transition-colors duration-200 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
