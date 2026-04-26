import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, LayoutDashboard, Search, History, TrendingUp, User, LogOut, Download, CheckCircle, Activity, CalendarDays, Bell } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import ConditionBadge from './ConditionBadge';
import { useUser } from '@/context/UserContext';
import { toast } from './Toast';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const links = [
  { to: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/check',     label: 'Check Food',   icon: Search },
  { to: '/history',   label: 'History',      icon: History },
  { to: '/symptoms',  label: 'Symptoms',     icon: Activity },
  { to: '/mealplan',      label: 'Meal Plan',    icon: CalendarDays },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/report',    label: 'Weekly Report',icon: TrendingUp },
  { to: '/profile',   label: 'Profile',      icon: User },
];

const bmiColors: Record<string, string> = {
  'Healthy Weight': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Underweight':    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Overweight':     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Obese':          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export default function Sidebar() {
  const { userName, bmi, bmiCategory, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { canInstall, install, isInstalled } = usePWAInstall();

  function handleLogout() {
    if (window.confirm('Are you sure you want to log out?')) {
      // Keep all setup data, just mark logged out so re-login goes to dashboard
      try {
        const existing = JSON.parse(localStorage.getItem('gutsense_user') || '{}');
        localStorage.setItem('gutsense_user', JSON.stringify({ ...existing, loggedOut: true }));
      } catch {}
      logout();
      toast.success('Logged out successfully');
      navigate('/');
    }
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-card border-r border-border z-30 print:hidden">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center animate-heartbeat">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">GutSense</span>
      </div>

      {/* User */}
      <div className="px-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-good text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{userName || 'User'}</p>
            <ConditionBadge />
          </div>
        </div>
        {bmi && bmiCategory && (
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${bmiColors[bmiCategory] ?? bmiColors['Healthy Weight']}`}>
            BMI: {bmi} · {bmiCategory}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
      <div className="p-4 border-t border-border space-y-2">
        {canInstall && !isInstalled && (
          <button onClick={install}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-950/50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4 shrink-0" />
            Install GutSense App
          </button>
        )}
        {isInstalled && (
          <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-sm font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />
            App Installed ✓
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
        <DarkModeToggle />
      </div>
    </aside>
  );
}
