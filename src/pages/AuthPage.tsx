import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Leaf, Sparkles } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { getPasswordStrength } from '@/utils/validation';
import { toast } from '@/components/Toast';

const strengthColors = { weak: 'bg-red-500', fair: 'bg-amber-500', good: 'bg-yellow-400', strong: 'bg-green-500' };
const strengthWidths  = { weak: 'w-1/4', fair: 'w-2/4', good: 'w-3/4', strong: 'w-full' };
const strengthLabels  = { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' };

const VALID_EMAIL = 'dharanik269@gmail.com';
const VALID_PASS  = 'pink4pug';
const KEY = 'gutsense_user';

export default function AuthPage() {
  const navigate = useNavigate();
  const { setUserName, setUserEmail, restoreFromStorage } = useUser();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pwStrength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!email.trim()) errs.email = 'Please enter your email';
    if (!password.trim()) errs.password = 'Please enter your password';
    if (mode === 'signup' && !agreed) errs.agreed = 'You must agree to the terms';

    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    if (email.trim().toLowerCase() !== VALID_EMAIL || password !== VALID_PASS) {
      setIsLoading(false);
      setErrors({ form: mode === 'signup' ? 'This is a private app. Please use the correct credentials.' : 'Invalid email or password.' });
      return;
    }

    const savedRaw = localStorage.getItem(KEY);
    const savedUser: Record<string, unknown> = savedRaw ? JSON.parse(savedRaw) : {};

    // Mark as logged in
    const updatedUser = { ...savedUser, loggedOut: false };

    if (mode === 'signup' && !savedUser.name) {
      // First ever signup — set name
      updatedUser.name = name.trim() || 'Dharani';
      updatedUser.email = VALID_EMAIL;
      updatedUser.password = VALID_PASS;
      updatedUser.setupCompleted = false;
    }

    localStorage.setItem(KEY, JSON.stringify(updatedUser));

    // Atomically restore ALL context from localStorage in one setState call
    restoreFromStorage();

    setIsLoading(false);

    if (updatedUser.setupCompleted === true) {
      toast.success(`Welcome back, ${updatedUser.name || 'Dharani'}!`);
      navigate('/dashboard');
    } else {
      toast.success('Account ready! Let\'s set up your health profile.');
      navigate('/setup');
    }
  }

  function switchMode(m: 'signup' | 'login') {
    setMode(m);
    setErrors({});
    setPassword('');
    setConfirm('');
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-primary to-good flex-col items-center justify-center relative overflow-hidden p-12">
        {/* Blobs */}
        {[
          'w-40 h-40 top-10 left-10',
          'w-64 h-64 bottom-20 right-8',
          'w-24 h-24 top-1/2 left-1/3',
          'w-16 h-16 top-1/4 right-1/4',
        ].map((cls, i) => (
          <div key={i} className={`absolute ${cls} bg-white/10 rounded-full animate-float`} style={{ animationDelay: `${i * 0.4}s` }} />
        ))}

        <div className="relative z-10 text-center text-primary-foreground">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 animate-heartbeat">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-2">GutSense</h1>
          <p className="text-primary-foreground/80 text-lg mb-10">Your gut. Your health. Your rules.</p>

          <div className="space-y-4 text-left">
            {[
              { title: 'AI-Powered Food Analysis', desc: 'Scan any food and get instant gut health insights' },
              { title: 'Personalized for Your Condition', desc: 'Tailored advice for Peptic Ulcer, GERD, IBS and more' },
              { title: 'Track Your Progress', desc: 'Monitor your gut health score week by week' },
            ].map((f, i) => (
              <div key={f.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-start gap-3 animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-primary-foreground/70 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-primary-foreground/60 text-xs mt-10">Join 10,000+ users managing their gut health smartly</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">GutSense</span>
          </div>

          {/* Mode tabs */}
          <div className="bg-muted rounded-2xl p-1 flex mb-8">
            {(['signup', 'login'] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === m ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {m === 'signup' ? 'Sign Up' : 'Log In'}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            {mode === 'signup' ? 'Create your account' : 'Welcome back!'}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {mode === 'signup' ? 'Start your gut health journey' : 'Sign in to your GutSense account'}
          </p>

          {errors.form && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name — signup only */}
            {mode === 'signup' && (
              <div>
                <div className={`relative flex items-center border-2 rounded-2xl bg-card transition-colors ${errors.name ? 'border-red-400' : 'border-border focus-within:border-primary'}`}>
                  <User className="w-4 h-4 text-muted-foreground ml-4 shrink-0" />
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="flex-1 px-3 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <div className={`relative flex items-center border-2 rounded-2xl bg-card transition-colors ${errors.email ? 'border-red-400' : 'border-border focus-within:border-primary'}`}>
                <Mail className="w-4 h-4 text-muted-foreground ml-4 shrink-0" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="flex-1 px-3 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className={`relative flex items-center border-2 rounded-2xl bg-card transition-colors ${errors.password ? 'border-red-400' : 'border-border focus-within:border-primary'}`}>
                <Lock className="w-4 h-4 text-muted-foreground ml-4 shrink-0" />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="flex-1 px-3 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="mr-4 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
              {/* Strength bar — signup only */}
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2 px-1">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthColors[pwStrength.strength]} ${strengthWidths[pwStrength.strength]}`} />
                  </div>
                  <p className={`text-xs mt-1 ${strengthColors[pwStrength.strength].replace('bg-', 'text-')}`}>
                    {strengthLabels[pwStrength.strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password — signup only */}
            {mode === 'signup' && (
              <div>
                <div className={`relative flex items-center border-2 rounded-2xl bg-card transition-colors ${errors.confirm ? 'border-red-400' : confirm && confirm === password ? 'border-green-400' : 'border-border focus-within:border-primary'}`}>
                  <Lock className="w-4 h-4 text-muted-foreground ml-4 shrink-0" />
                  <input
                    type={showCf ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm Password"
                    className="flex-1 px-3 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                  />
                  <button type="button" onClick={() => setShowCf((v) => !v)} className="mr-4 text-muted-foreground hover:text-foreground transition-colors">
                    {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm && <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirm}</p>}
              </div>
            )}

            {/* Forgot password — login only */}
            {mode === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => alert('Password reset coming soon!')} className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Terms — signup only */}
            {mode === 'signup' && (
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-primary" />
                  <span className="text-xs text-muted-foreground">
                    I agree to the{' '}
                    <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
                  </span>
                </label>
                {errors.agreed && <p className="text-red-500 text-xs mt-1 ml-1">{errors.agreed}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-good text-primary-foreground rounded-2xl py-3.5 font-semibold hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{mode === 'signup' ? 'Creating account...' : 'Signing in...'}</>
              ) : (
                mode === 'signup' ? 'Sign Up' : 'Log In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')} className="text-primary font-semibold hover:underline">
              {mode === 'signup' ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
