import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search, History, TrendingUp } from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/check', label: 'Check', icon: Search },
  { to: '/history', label: 'History', icon: History },
  { to: '/report', label: 'Report', icon: TrendingUp },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-[env(safe-area-inset-bottom)] print:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const active = location.pathname === item.to;
          return (
            <NavLink key={item.label} to={item.to} className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[44px] min-h-[44px] justify-center active:scale-95 transition-transform duration-150">
              <div className="relative">
                <item.icon className={`w-5 h-5 transition-all duration-200 ${active ? 'text-primary scale-110' : 'text-muted-foreground'}`} />
                {active && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-popIn" />}
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${active ? 'text-primary' : 'text-muted-foreground'}`}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
