import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Edit3, Save, X, Shield, Bell, Palette,
  User, Activity, Target, Utensils, Flame, Calendar,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import ConditionBadge from '@/components/ConditionBadge';
import { useUser } from '@/context/UserContext';
import { calculateBMI, getBMICategory } from '@/utils/validation';
import { toast } from '@/components/Toast';

const CONDITIONS = [
  'Peptic Ulcer', 'GERD', 'IBS', "Crohn's Disease",
  'Gastritis', "I'm Healthy", 'Other',
];

const GOALS = [
  'Improve Digestion', 'Manage My Condition', 'Eat Healthier',
  'Lose Weight', 'Boost Energy', 'Better Sleep',
];

const bmiColorMap: Record<string, string> = {
  'Healthy Weight': 'from-green-500 to-emerald-400',
  'Underweight':    'from-blue-500 to-cyan-400',
  'Overweight':     'from-amber-500 to-yellow-400',
  'Obese':          'from-rose-500 to-red-400',
};

export default function Profile() {
  const navigate = useNavigate();
  const {
    userName, userEmail, gutCondition, allConditions, customCondition,
    age, gender, height, weight, bmi, bmiCategory, healthGoals,
    isDarkMode, toggleDarkMode, foodHistory, logout,
    setUserName, setGutCondition, setAllConditions, setCustomCondition,
    setAge, setGender, setHeight, setWeight, setBmi, setBmiCategory, setHealthGoals,
  } = useUser();

  // Edit modals
  const [editSection, setEditSection] = useState<'personal' | 'measurements' | 'conditions' | 'goals' | null>(null);

  // Edit state
  const [editAge, setEditAge]       = useState(age || 0);
  const [editGender, setEditGender] = useState(gender || '');
  const [editHeight, setEditHeight] = useState(height || 0);
  const [editWeight, setEditWeight] = useState(weight || 0);
  const [editConditions, setEditConditions] = useState<string[]>(allConditions?.length > 0 ? allConditions : gutCondition ? [gutCondition] : []);
  const [editCustom, setEditCustom] = useState(customCondition || '');
  const [editGoals, setEditGoals]   = useState<string[]>(healthGoals || []);

  function openEdit(section: typeof editSection) {
    setEditAge(age || 0);
    setEditGender(gender || '');
    setEditHeight(height || 0);
    setEditWeight(weight || 0);
    setEditConditions(allConditions?.length > 0 ? allConditions : gutCondition ? [gutCondition] : []);
    setEditCustom(customCondition || '');
    setEditGoals(healthGoals || []);
    setEditSection(section);
  }

  function saveEdit() {
    const KEY = 'gutsense_user';
    const existing = JSON.parse(localStorage.getItem(KEY) || '{}');

    if (editSection === 'personal') {
      setAge(editAge); setGender(editGender);
      localStorage.setItem(KEY, JSON.stringify({ ...existing, age: editAge, gender: editGender }));
    }
    if (editSection === 'measurements') {
      const newBmi = editHeight > 0 && editWeight > 0 ? calculateBMI(editWeight, editHeight) : bmi;
      const cat = newBmi ? getBMICategory(newBmi) : null;
      setHeight(editHeight); setWeight(editWeight);
      if (newBmi) { setBmi(newBmi); if (cat) setBmiCategory(cat.label); }
      localStorage.setItem(KEY, JSON.stringify({ ...existing, height: editHeight, weight: editWeight, bmi: newBmi, bmiCategory: cat?.label || '' }));
    }
    if (editSection === 'conditions') {
      const primary = editConditions.filter(c => c !== 'Other')[0] || gutCondition || "I'm Healthy";
      setGutCondition(primary); setAllConditions(editConditions); setCustomCondition(editCustom);
      localStorage.setItem(KEY, JSON.stringify({ ...existing, gutCondition: primary, allConditions: editConditions, customCondition: editCustom }));
    }
    if (editSection === 'goals') {
      setHealthGoals(editGoals);
      localStorage.setItem(KEY, JSON.stringify({ ...existing, goals: editGoals }));
    }

    setEditSection(null);
    toast.success('Profile updated successfully!');
  }

  function handleLogout() {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      toast.success('Logged out successfully');
      navigate('/');
    }
  }

  const goodCount = foodHistory.filter(f => f.rating === 'good').length;
  const totalChecked = foodHistory.length;
  const safePercent = totalChecked > 0 ? Math.round((goodCount / totalChecked) * 100) : 0;
  const currentBmi = bmi || (height && weight ? calculateBMI(weight, height) : null);
  const currentBmiCat = bmiCategory || (currentBmi ? getBMICategory(currentBmi).label : '');
  const bmiGradient = bmiColorMap[currentBmiCat] || bmiColorMap['Healthy Weight'];
  const bmiPct = currentBmi ? Math.min(Math.max(((currentBmi - 10) / 30) * 100, 0), 100) : 50;

  // Days since joined
  const daysSince = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('gutsense_user') || '{}');
      if (!u.createdAt) return '—';
      return Math.max(1, Math.floor((Date.now() - new Date(u.createdAt).getTime()) / 86400000));
    } catch { return '—'; }
  })();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-6">
          <div className="w-full p-6 md:p-8">

            {/* ── Profile hero — full width ── */}
            <div className="w-full rounded-3xl p-8 bg-gradient-to-r from-primary to-good text-primary-foreground relative overflow-hidden mb-6">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 right-20 w-24 h-24 rounded-full bg-white/5" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold text-white shrink-0">
                  {userName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-white truncate">{userName || 'User'}</h1>
                  <p className="text-white/80 text-sm mt-1">{userEmail}</p>
                  <div className="mt-2"><ConditionBadge /></div>
                </div>
                <div className="hidden md:flex gap-6 ml-auto shrink-0">
                  {[
                    { value: currentBmi ?? '—', label: 'BMI' },
                    { value: age ?? '—', label: 'Age' },
                    { value: daysSince, label: 'Days' },
                  ].map(({ value, label }) => (
                    <div key={label} className="flex flex-col items-center text-center">
                      <span className="text-2xl font-bold text-white">{value}</span>
                      <span className="text-white/70 text-xs mt-1">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Stats row — full width ── */}
            <div className="w-full grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Foods Checked', value: totalChecked, color: 'text-primary' },
                { label: 'Safe Choices',  value: `${safePercent}%`, color: 'text-good' },
                { label: 'Day Streak',    value: 5, color: 'text-moderate' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* ── Two-column main content ── */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* LEFT COLUMN */}
              <div className="space-y-6">

                {/* Personal Info */}
                <div className="w-full bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Personal Info</h2>
                    <button onClick={() => openEdit('personal')} className="text-sm text-primary hover:underline flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-6 p-6">
                    <div><p className="text-xs text-muted-foreground mb-1">Age</p><p className="text-base font-semibold text-foreground">{age ? `${age} years` : '—'}</p></div>
                    <div><p className="text-xs text-muted-foreground mb-1">Gender</p><p className="text-base font-semibold text-foreground">{gender || '—'}</p></div>
                  </div>
                </div>

                {/* Body Measurements */}
                <div className="w-full bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Body Measurements</h2>
                    <button onClick={() => openEdit('measurements')} className="text-sm text-primary hover:underline flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div><p className="text-xs text-muted-foreground mb-1">Height</p><p className="text-base font-semibold text-foreground">{height ? `${height} cm` : '—'}</p></div>
                      <div><p className="text-xs text-muted-foreground mb-1">Weight</p><p className="text-base font-semibold text-foreground">{weight ? `${weight} kg` : '—'}</p></div>
                    </div>
                    {currentBmi && (
                      <div className={`w-full rounded-2xl p-4 bg-gradient-to-br ${bmiGradient} text-white`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white/70 text-xs">BMI</p>
                            <p className="text-3xl font-bold">{currentBmi}</p>
                            <p className="text-sm font-semibold mt-0.5">{currentBmiCat}</p>
                          </div>
                        </div>
                        <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="absolute inset-0 flex">
                            <div className="flex-1 bg-blue-300/60" /><div className="flex-1 bg-green-300/60" />
                            <div className="flex-1 bg-amber-300/60" /><div className="flex-1 bg-red-300/60" />
                          </div>
                          <div className="absolute top-0 h-full w-1 bg-white rounded-full" style={{ left: `${bmiPct}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-white/50 mt-1">
                          <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* App Preferences */}
                <div className="w-full bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">App Preferences</h2>
                  </div>
                  <div className="divide-y divide-border">
                    <button onClick={toggleDarkMode} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-muted transition-colors text-left">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Palette className="w-5 h-5 text-primary" /></div>
                      <div className="flex-1"><p className="font-medium text-foreground text-sm">Dark Mode</p><p className="text-xs text-muted-foreground">{isDarkMode ? 'Currently on' : 'Currently off'}</p></div>
                      <div className={`w-11 h-6 rounded-full transition-colors duration-300 flex items-center px-0.5 shrink-0 ${isDarkMode ? 'bg-primary' : 'bg-muted'}`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </button>
                    <div className="flex items-center gap-4 px-6 py-4">
                      <div className="w-9 h-9 rounded-xl bg-good/10 flex items-center justify-center shrink-0"><Bell className="w-5 h-5 text-good" /></div>
                      <div className="flex-1"><p className="font-medium text-foreground text-sm">Notifications</p><p className="text-xs text-muted-foreground">Daily tips & reminders</p></div>
                      <div className="w-11 h-6 rounded-full bg-good flex items-center px-0.5 shrink-0"><div className="w-5 h-5 rounded-full bg-white shadow-sm translate-x-5" /></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">

                {/* Gut Conditions */}
                <div className="w-full bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Gut Conditions</h2>
                    <button onClick={() => openEdit('conditions')} className="text-sm text-primary hover:underline flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                  </div>
                  <div className="p-6">
                    {(allConditions?.length > 0 || gutCondition) ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(allConditions?.length > 0 ? allConditions : [gutCondition]).map((c) => (
                          <span key={c} className="px-4 py-2 rounded-full text-sm font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-700">{c}</span>
                        ))}
                        {customCondition && <span className="px-4 py-2 rounded-full text-sm bg-muted text-muted-foreground">{customCondition}</span>}
                      </div>
                    ) : <p className="text-muted-foreground text-sm">No conditions set</p>}
                  </div>
                </div>

                {/* Health Goals */}
                <div className="w-full bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Health Goals</h2>
                    <button onClick={() => openEdit('goals')} className="text-sm text-primary hover:underline flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                  </div>
                  <div className="p-6">
                    {healthGoals?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 mt-1">
                        {healthGoals.map((g) => (
                          <div key={g} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 text-sm text-foreground">
                            <Target className="w-4 h-4 text-primary shrink-0" />{g}
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-muted-foreground text-sm">No goals set</p>}
                  </div>
                </div>

                {/* Journey Stats */}
                <div className="w-full bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Your GutSense Journey</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { icon: <Utensils className="w-6 h-6 text-primary" />, value: totalChecked, label: 'Foods Checked' },
                        { icon: <Flame className="w-6 h-6 text-moderate" />,   value: 5,            label: 'Best Streak' },
                        { icon: <Calendar className="w-6 h-6 text-good" />,    value: daysSince,    label: 'Days Active' },
                      ].map(({ icon, value, label }) => (
                        <div key={label} className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-2xl">
                          {icon}
                          <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Account / Logout */}
                <div className="w-full bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border"><h2 className="font-semibold text-foreground">Account</h2></div>
                  <div className="p-6">
                    <button onClick={handleLogout} className="w-full bg-poor/10 text-poor border border-poor/20 rounded-2xl p-4 flex items-center gap-4 font-semibold hover:bg-poor/20 transition-all duration-200">
                      <LogOut className="w-5 h-5" /> Log Out
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="w-full bg-card rounded-2xl border-2 border-red-200 dark:border-red-900 overflow-hidden">
                  <div className="px-6 py-4 border-b border-red-200 dark:border-red-900">
                    <h2 className="font-semibold text-red-600">Danger Zone</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-4">Resetting will clear all your food history and return you to setup.</p>
                    <button onClick={() => {
                      if (window.confirm('Reset all data? This cannot be undone.')) {
                        localStorage.removeItem('gutsense_user');
                        navigate('/');
                      }
                    }} className="w-full py-3 rounded-xl border-2 border-red-500 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                      Reset All Data
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editSection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditSection(null)}>
          <div className="bg-background rounded-3xl p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground capitalize">
                Edit {editSection === 'personal' ? 'Personal Info' : editSection === 'measurements' ? 'Measurements' : editSection === 'conditions' ? 'Gut Conditions' : 'Health Goals'}
              </h3>
              <button onClick={() => setEditSection(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"><X className="w-4 h-4" /></button>
            </div>

            {editSection === 'personal' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Age</label>
                  <input type="number" min={10} max={100} value={editAge} onChange={(e) => setEditAge(parseInt(e.target.value) || 0)}
                    className="w-full border-2 border-border rounded-2xl px-4 py-3 bg-card text-foreground focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Prefer not to say'].map((g) => (
                      <button key={g} onClick={() => setEditGender(g)}
                        className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${editGender === g ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {editSection === 'measurements' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Height (cm)</label>
                  <input type="number" min={100} max={250} value={editHeight} onChange={(e) => setEditHeight(parseInt(e.target.value) || 0)}
                    className="w-full border-2 border-border rounded-2xl px-4 py-3 bg-card text-foreground focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Weight (kg)</label>
                  <input type="number" min={30} max={300} value={editWeight} onChange={(e) => setEditWeight(parseInt(e.target.value) || 0)}
                    className="w-full border-2 border-border rounded-2xl px-4 py-3 bg-card text-foreground focus:border-primary focus:outline-none" />
                </div>
                {editHeight > 0 && editWeight > 0 && (
                  <div className="bg-muted/50 rounded-2xl p-4 text-center">
                    <p className="text-xs text-muted-foreground">New BMI</p>
                    <p className="text-2xl font-bold text-foreground">{calculateBMI(editWeight, editHeight)}</p>
                    <p className="text-sm text-muted-foreground">{getBMICategory(calculateBMI(editWeight, editHeight)).label}</p>
                  </div>
                )}
              </div>
            )}

            {editSection === 'conditions' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {CONDITIONS.map((c) => {
                    const sel = editConditions.includes(c);
                    return (
                      <button key={c} onClick={() => setEditConditions(prev => sel ? prev.filter(x => x !== c) : [...prev, c])}
                        className={`p-3 rounded-2xl border-2 text-sm font-medium text-left transition-all ${sel ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-foreground hover:border-primary/40'}`}>
                        {c}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Other condition</label>
                  <textarea value={editCustom} onChange={(e) => setEditCustom(e.target.value)} rows={2} placeholder="e.g. Lactose intolerance..."
                    className="w-full border-2 border-border rounded-2xl px-4 py-3 bg-card text-foreground focus:border-primary focus:outline-none resize-none text-sm" />
                </div>
              </div>
            )}

            {editSection === 'goals' && (
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((g) => {
                  const sel = editGoals.includes(g);
                  return (
                    <button key={g} onClick={() => setEditGoals(prev => sel ? prev.filter(x => x !== g) : [...prev, g])}
                      className={`p-3 rounded-2xl border-2 text-sm font-medium text-left transition-all ${sel ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-foreground hover:border-primary/40'}`}>
                      {g}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditSection(null)} className="flex-1 border-2 border-border text-foreground rounded-2xl py-3 font-semibold hover:bg-muted transition-all">Cancel</button>
              <button onClick={saveEdit} className="flex-1 bg-primary text-primary-foreground rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
