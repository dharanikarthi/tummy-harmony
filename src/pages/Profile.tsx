import { useState } from 'react';
import { User, Mail, Lock, LogOut, Edit3, Save, Shield, Bell, Palette, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import ConditionBadge from '@/components/ConditionBadge';
import { useUser } from '@/context/UserContext';
import { staggerDelay } from '@/utils/animations';

const conditions = ['Peptic Ulcer', 'GERD', 'IBS', "Crohn's Disease", 'Gastritis', "I'm Healthy"];

export default function Profile() {
  const { userName, gutCondition, setUserName, setGutCondition, isDarkMode, toggleDarkMode, foodHistory } = useUser();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editCondition, setEditCondition] = useState(gutCondition);

  // Mock auth state
  const [isLoggedIn, setIsLoggedIn] = useState(!!userName);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    setUserName(editName);
    setGutCondition(editCondition);
    setIsEditing(false);
  };

  const handleAuth = () => {
    setIsLoggedIn(true);
    setAuthMode(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthMode(null);
  };

  const goodCount = foodHistory.filter(f => f.rating === 'good').length;
  const totalChecked = foodHistory.length || 12;
  const safePercent = totalChecked > 0 ? Math.round((goodCount / totalChecked) * 100) : 72;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64 pb-24 lg:pb-8">
        <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary to-good rounded-3xl p-6 text-primary-foreground animate-fadeInDown">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm border-2 border-primary-foreground/30">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{userName || 'User'}</h1>
                <div className="mt-1"><ConditionBadge /></div>
                <p className="text-primary-foreground/70 text-sm mt-1">Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="w-10 h-10 rounded-2xl bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-all duration-200 hover:scale-105 active:scale-95">
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 animate-fadeInUp" style={staggerDelay(1, 100)}>
            <div className="bg-card border border-border rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <p className="text-2xl font-bold text-primary">{totalChecked}</p>
              <p className="text-xs text-muted-foreground">Foods Checked</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <p className="text-2xl font-bold text-good">{safePercent}%</p>
              <p className="text-xs text-muted-foreground">Safe Choices</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <p className="text-2xl font-bold text-moderate">5</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>

          {/* Edit Profile Section */}
          {isEditing && (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-fadeInUp">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><Edit3 className="w-4 h-4 text-primary" /> Edit Profile</h2>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Display Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full border-2 border-border rounded-2xl px-4 py-3 bg-background text-foreground focus:border-primary focus:outline-none transition-all duration-300" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Gut Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {conditions.map(c => (
                    <button key={c} onClick={() => setEditCondition(c)} className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 ${editCondition === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
                <button onClick={() => setIsEditing(false)} className="flex-1 border-2 border-border text-foreground rounded-2xl py-3 font-semibold hover:bg-muted transition-all duration-200">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Settings Cards */}
          <div className="space-y-3 animate-fadeInUp" style={staggerDelay(2, 100)}>
            <h2 className="font-semibold text-foreground text-lg">Settings</h2>

            <button onClick={toggleDarkMode} className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Palette className="w-5 h-5 text-primary" /></div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground">{isDarkMode ? 'Currently on' : 'Currently off'}</p>
              </div>
              <div className={`w-12 h-7 rounded-full transition-colors duration-300 flex items-center px-1 ${isDarkMode ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`w-5 h-5 rounded-full bg-primary-foreground shadow-sm transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>

            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-good/10 flex items-center justify-center"><Bell className="w-5 h-5 text-good" /></div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Daily tips & reminders</p>
              </div>
              <div className="w-12 h-7 rounded-full bg-good flex items-center px-1">
                <div className="w-5 h-5 rounded-full bg-primary-foreground shadow-sm translate-x-5" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-moderate/10 flex items-center justify-center"><Shield className="w-5 h-5 text-moderate" /></div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Privacy & Data</p>
                <p className="text-xs text-muted-foreground">Manage your data preferences</p>
              </div>
            </div>
          </div>

          {/* Auth Section */}
          <div className="space-y-3 animate-fadeInUp" style={staggerDelay(3, 100)}>
            <h2 className="font-semibold text-foreground text-lg">Account</h2>

            {!isLoggedIn && !authMode && (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <p className="text-sm text-muted-foreground">Sign in to sync your data across devices</p>
                <div className="flex gap-3">
                  <button onClick={() => setAuthMode('login')} className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Log In
                  </button>
                  <button onClick={() => setAuthMode('signup')} className="flex-1 border-2 border-primary text-primary rounded-2xl py-3 font-semibold hover:bg-primary/5 transition-all duration-200">
                    Sign Up
                  </button>
                </div>
              </div>
            )}

            {authMode && (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4 animate-fadeInUp">
                <h3 className="font-semibold text-foreground">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-2xl bg-background text-foreground focus:border-primary focus:outline-none transition-all duration-300" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full pl-11 pr-11 py-3 border-2 border-border rounded-2xl bg-background text-foreground focus:border-primary focus:outline-none transition-all duration-300" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button onClick={handleAuth} className="w-full bg-primary text-primary-foreground rounded-2xl py-3 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  {authMode === 'login' ? 'Log In' : 'Sign Up'}
                </button>
                <button onClick={() => setAuthMode(null)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              </div>
            )}

            {isLoggedIn && (
              <button onClick={handleLogout} className="w-full bg-poor/10 text-poor border border-poor/20 rounded-2xl p-4 flex items-center gap-4 font-semibold hover:bg-poor/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200">
                <LogOut className="w-5 h-5" />
                Log Out
              </button>
            )}
          </div>

        </div>
      </div>
      <BottomNav />
    </div>
  );
}
