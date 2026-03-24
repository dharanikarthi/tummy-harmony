import { Moon, Sun } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useUser();
  return (
    <button
      onClick={toggleDarkMode}
      className="relative p-2 rounded-2xl bg-muted hover:bg-accent transition-colors duration-200 active:scale-95"
      aria-label="Toggle dark mode"
    >
      <div className="transition-transform duration-500" style={{ transform: isDarkMode ? 'rotate(360deg)' : 'rotate(0deg)' }}>
        {isDarkMode ? <Sun className="w-5 h-5 text-moderate" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
      </div>
    </button>
  );
}
