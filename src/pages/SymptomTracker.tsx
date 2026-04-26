import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Activity, ChevronDown, ChevronUp, CheckCircle, X, Search,
  Utensils, Brain, RefreshCw,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useUser } from '@/context/UserContext';
import { type SymptomLog } from '@/context/UserContext';
import FoodSearchInput from '@/components/FoodSearchInput';

/* ── constants ─────────────────────────────────────────────── */
const SYMPTOMS = [
  { id: 'bloating',     label: 'Bloating',      emoji: '🫃' },
  { id: 'pain',         label: 'Stomach Pain',  emoji: '😣' },
  { id: 'nausea',       label: 'Nausea',        emoji: '🤢' },
  { id: 'heartburn',    label: 'Heartburn',     emoji: '🔥' },
  { id: 'diarrhea',     label: 'Diarrhea',      emoji: '💧' },
  { id: 'constipation', label: 'Constipation',  emoji: '😖' },
  { id: 'gas',          label: 'Gas',           emoji: '💨' },
  { id: 'cramps',       label: 'Cramps',        emoji: '⚡' },
  { id: 'fatigue',      label: 'Fatigue',       emoji: '😴' },
  { id: 'reflux',       label: 'Acid Reflux',   emoji: '🌋' },
  { id: 'fine',         label: 'Feeling Fine',  emoji: '😊' },
  { id: 'great',        label: 'Feeling Great', emoji: '🌟' },
];

const POSITIVE_IDS = ['fine', 'great'];
const TIME_OPTIONS = ['30 min', '1 hour', '2 hours', '3+ hours', 'Next day'];

const SEVERITY = [
  { val: 1, emoji: '😊', label: 'None',       border: 'border-green-400',  bg: 'bg-green-50 dark:bg-green-950/30' },
  { val: 2, emoji: '🙂', label: 'Mild',       border: 'border-green-400',  bg: 'bg-green-50 dark:bg-green-950/30' },
  { val: 3, emoji: '😐', label: 'Moderate',   border: 'border-amber-400',  bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { val: 4, emoji: '😟', label: 'Severe',     border: 'border-red-400',    bg: 'bg-red-50 dark:bg-red-950/30' },
  { val: 5, emoji: '😫', label: 'Very Severe',border: 'border-red-500',    bg: 'bg-red-50 dark:bg-red-950/30' },
];

const MOODS = [
  { val: 'great',   emoji: '😄', label: 'Great' },
  { val: 'good',    emoji: '🙂', label: 'Good' },
  { val: 'neutral', emoji: '😐', label: 'Neutral' },
  { val: 'bad',     emoji: '😕', label: 'Bad' },
  { val: 'terrible',emoji: '😞', label: 'Terrible' },
];

const RATING_COLORS: Record<string, string> = {
  good:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  poor:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

/* ── main component ─────────────────────────────────────────── */
export default function SymptomTracker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { gutCondition, bmi, bmiCategory, symptomLogs, addSymptomLog } = useUser();

  const isLogging = searchParams.get('log') === 'new';
  const [view, setView] = useState<'log' | 'history' | 'insights'>(isLogging ? 'log' : 'history');

  /* ── log form state ── */
  const [logData, setLogData] = useState({
    foodRating: 'moderate' as 'good' | 'moderate' | 'poor',
    symptoms: [] as string[], severity: 3, timeAfterEating: '1 hour',
    mood: 'neutral' as SymptomLog['mood'],
  });
  const [foodInput, setFoodInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const foodInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  /* ── local logs — read directly from localStorage so saves are always visible ── */
  const [localLogs, setLocalLogs] = useState<SymptomLog[]>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('gutsense_user') || '{}');
      return Array.isArray(u.symptomLogs) ? u.symptomLogs : [];
    } catch { return []; }
  });

  // Merge context logs with local logs (context may lag behind)
  const allLogs = localLogs.length >= symptomLogs.length ? localLogs : symptomLogs;

  /* ── history state ── */
  const [filter, setFilter] = useState<'all' | 'good' | 'moderate' | 'poor'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  /* ── insights state ── */
  const [insightData, setInsightData] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const barsRef = useRef<HTMLDivElement>(null);
  const [barsVisible, setBarsVisible] = useState(false);

  /* ── pre-fill from sessionStorage ── */
  useEffect(() => {
    const pending = sessionStorage.getItem('pending_symptom_food');
    if (pending) {
      const data = JSON.parse(pending);
      setFoodInput(data.foodName || '');
      setLogData(prev => ({ ...prev, foodRating: data.foodRating || 'moderate' }));
      sessionStorage.removeItem('pending_symptom_food');
    }
  }, []);

  /* ── bar in-view ── */
  useEffect(() => {
    if (!barsRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setBarsVisible(true); }, { threshold: 0.2 });
    obs.observe(barsRef.current);
    return () => obs.disconnect();
  }, [view]);

  /* ── symptom toggle ── */
  function toggleSymptom(id: string) {
    setLogData(prev => {
      const isPositive = POSITIVE_IDS.includes(id);
      let next: string[];
      if (prev.symptoms.includes(id)) {
        next = prev.symptoms.filter(s => s !== id);
      } else if (isPositive) {
        next = [id]; // deselect all others
      } else {
        next = [...prev.symptoms.filter(s => !POSITIVE_IDS.includes(s)), id];
      }
      return { ...prev, symptoms: next };
    });
  }

  /* ── save log ── */
  function handleSaveLog() {
    setValidationError('');
    if (!foodInput.trim()) {
      setValidationError('Please enter a food name');
      return;
    }

    const newLog: SymptomLog = {
      id: Date.now(),
      foodName: foodInput.trim(),
      foodRating: logData.foodRating,
      symptoms: logData.symptoms,
      severity: logData.severity as SymptomLog['severity'],
      timeAfterEating: logData.timeAfterEating,
      notes: notesInput.trim(),
      mood: logData.mood,
      date: new Date().toISOString(),
      dateDisplay: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    // 1. Write directly to localStorage — guaranteed, no async
    try {
      const existing = JSON.parse(localStorage.getItem('gutsense_user') || '{}');
      const updated = [newLog, ...(Array.isArray(existing.symptomLogs) ? existing.symptomLogs : [])];
      localStorage.setItem('gutsense_user', JSON.stringify({ ...existing, symptomLogs: updated }));
      setLocalLogs(updated);
    } catch (e) {
      console.error('localStorage write failed:', e);
    }

    // 2. Also update context (best-effort)
    try { addSymptomLog(newLog); } catch (e) { console.error('addSymptomLog failed:', e); }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setView('history');
      setFoodInput('');
      setNotesInput('');
      setLogData({ foodRating: 'moderate', symptoms: [], severity: 3, timeAfterEating: '1 hour', mood: 'neutral' });
    }, 1500);
  }

  /* ── pattern calculations ── */
  function calculatePatterns() {
    if (allLogs.length === 0) return null;
    const triggerFoods = [...new Set(allLogs.filter(l => l.severity >= 3 && l.symptoms.some(s => !POSITIVE_IDS.includes(s))).map(l => l.foodName))];
    const safeFoods    = [...new Set(allLogs.filter(l => l.severity <= 2 || l.symptoms.some(s => POSITIVE_IDS.includes(s))).map(l => l.foodName))];
    const symptomCount: Record<string, number> = {};
    allLogs.forEach(l => l.symptoms.forEach(s => { if (!POSITIVE_IDS.includes(s)) symptomCount[s] = (symptomCount[s] || 0) + 1; }));
    const topSymptoms = Object.entries(symptomCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s);
    const avgSeverity = Math.round(allLogs.reduce((sum, l) => sum + l.severity, 0) / allLogs.length * 10) / 10;
    return { triggerFoods, safeFoods, topSymptoms, symptomCount, avgSeverity, totalLogs: allLogs.length };
  }

  /* ── Groq insights ── */
  async function generateAIInsights() {
    if (allLogs.length < 3) return;
    setIsLoadingInsights(true);
    const patterns = calculatePatterns();
    const logSummary = allLogs.slice(0, 10).map(l =>
      `Food: ${l.foodName}, Symptoms: ${l.symptoms.join(', ')}, Severity: ${l.severity}/5, Time: ${l.timeAfterEating}`
    ).join('\n');
    const prompt = `You are a gut health specialist analyzing a patient's food symptom diary.
Patient condition: ${gutCondition || 'General'}
BMI: ${bmi} (${bmiCategory})
Recent symptom logs:\n${logSummary}
Patterns: Trigger foods: ${patterns?.triggerFoods.join(', ')}. Safe foods: ${patterns?.safeFoods.join(', ')}. Common symptoms: ${patterns?.topSymptoms.join(', ')}. Avg severity: ${patterns?.avgSeverity}/5.
Respond ONLY with valid JSON, no markdown:
{"headline":"<one powerful insight>","triggerPattern":"<explain trigger pattern>","safePattern":"<explain safe foods>","timePattern":"<when symptoms appear>","recommendations":["<rec1>","<rec2>","<rec3>"],"warningSign":"<most concerning pattern>","positiveSign":"<most encouraging pattern>","doctorNote":"<when to see doctor>"}`;
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 800, response_format: { type: 'json_object' } }),
      });
      const data = await res.json();
      setInsightData(JSON.parse(data.choices[0].message.content));
    } catch (err) { console.error('Insights error:', err); }
    finally { setIsLoadingInsights(false); }
  }

  const patterns = calculatePatterns();
  const filtered = filter === 'all' ? allLogs : allLogs.filter(l => l.foodRating === filter);


  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-6">
          <div className="w-full p-4 lg:p-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-6 h-6 text-purple-600" />
                  <h1 className="text-2xl font-bold text-foreground">Symptom Tracker</h1>
                </div>
                <p className="text-muted-foreground text-sm">Track how foods affect your gut</p>
              </div>
              <div className="flex gap-2 bg-muted rounded-2xl p-1">
                {(['log', 'history', 'insights'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${view === v ? 'bg-purple-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                    {v === 'log' ? '+ Log' : v}
                  </button>
                ))}
              </div>
            </div>

            {/* ════════ LOG VIEW ════════ */}
            {view === 'log' && (
              <div className="w-full">
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* LEFT COLUMN */}
                  <div className="space-y-4">

                    {/* Card 1 — Food info */}
                    <div className="w-full bg-card rounded-3xl border border-border p-6">
                      <h2 className="font-semibold text-foreground mb-4">What did you eat?</h2>
                      {/* Always-visible input with autocomplete */}
                      <FoodSearchInput
                        value={foodInput}
                        onChange={setFoodInput}
                        placeholder="What food did you eat?"
                        className="mb-4"
                      />
                      {/* Show rating badge when pre-filled from FoodChecker */}
                      {foodInput && logData.foodRating !== 'moderate' && (
                        <div className="flex items-center gap-2 mb-4">
                          <Utensils className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${RATING_COLORS[logData.foodRating]}`}>{logData.foodRating}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">When did symptoms appear?</p>
                        <div className="flex flex-wrap gap-2">
                          {TIME_OPTIONS.map(t => (
                            <button key={t} onClick={() => setLogData(p => ({ ...p, timeAfterEating: t }))}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${logData.timeAfterEating === t ? 'bg-purple-600 text-white border-purple-600' : 'border-border text-muted-foreground hover:border-purple-400'}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card 3 — Severity */}
                    <div className="w-full bg-card rounded-3xl border border-border p-6">
                      <h2 className="font-semibold text-foreground mb-4">How severe were the symptoms?</h2>
                      <div className="flex gap-2 mt-4">
                        {SEVERITY.map(s => (
                          <button key={s.val} onClick={() => setLogData(p => ({ ...p, severity: s.val }))}
                            className={`flex-1 flex flex-col items-center gap-2 p-2 md:p-3 rounded-2xl border-2 cursor-pointer transition-all ${logData.severity === s.val ? `${s.border} ${s.bg}` : 'border-border bg-card hover:border-purple-300'}`}>
                            <span className="text-2xl">{s.emoji}</span>
                            <span className="text-xs font-medium text-foreground text-center leading-tight">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Card 4 — Mood */}
                    <div className="w-full bg-card rounded-3xl border border-border p-6">
                      <h2 className="font-semibold text-foreground mb-4">Overall how do you feel?</h2>
                      <div className="flex gap-2 mt-4">
                        {MOODS.map(m => (
                          <button key={m.val} onClick={() => setLogData(p => ({ ...p, mood: m.val as SymptomLog['mood'] }))}
                            className={`flex-1 flex flex-col items-center gap-2 p-2 md:p-3 rounded-2xl border-2 cursor-pointer transition-all ${logData.mood === m.val ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30' : 'border-border bg-card hover:border-purple-300'}`}>
                            <span className="text-2xl">{m.emoji}</span>
                            <span className="text-xs font-medium text-foreground">{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-4">

                    {/* Card 2 — Symptoms */}
                    <div className="w-full bg-card rounded-3xl border border-border p-6">
                      <h2 className="font-semibold text-foreground mb-1">What symptoms did you experience?</h2>
                      <p className="text-xs text-muted-foreground mb-4">Select all that apply</p>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        {SYMPTOMS.map(s => {
                          const sel = logData.symptoms.includes(s.id);
                          return (
                            <button key={s.id} onClick={() => toggleSymptom(s.id)}
                              className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all text-left ${sel ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30' : 'border-border bg-card hover:border-purple-300'}`}>
                              <span className="text-xl shrink-0">{s.emoji}</span>
                              <span className={`text-sm font-medium ${sel ? 'text-purple-700 dark:text-purple-300' : 'text-foreground'}`}>{s.label}</span>
                              {sel && <CheckCircle className="w-4 h-4 text-purple-600 ml-auto shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card 5 — Notes */}
                    <div className="w-full bg-card rounded-3xl border border-border p-6">
                      <h2 className="font-semibold text-foreground mb-1">Any additional notes? <span className="text-muted-foreground font-normal text-sm">(optional)</span></h2>
                      <textarea
                        value={notesInput}
                        onChange={e => setNotesInput(e.target.value)}
                        rows={4}
                        placeholder="e.g. Had it with coffee, ate a large portion, skipped breakfast..."
                        className="w-full mt-3 rounded-2xl border border-border bg-background p-4 text-sm resize-none focus:outline-none focus:border-purple-500 text-foreground placeholder:text-muted-foreground transition-colors min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit — full width below grid */}
                {validationError && (
                  <p className="text-red-500 text-sm text-center mt-2">⚠️ {validationError}</p>
                )}
                <button onClick={handleSaveLog} disabled={showSuccess}
                  className={`w-full mt-4 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${showSuccess ? 'bg-green-500 text-white cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'}`}>
                  {showSuccess ? <><CheckCircle className="w-5 h-5" /> Symptom logged successfully!</> : <><Activity className="w-5 h-5" /> Save Symptom Log</>}
                </button>
              </div>
            )}


            {/* ════════ HISTORY VIEW ════════ */}
            {view === 'history' && (
              <div className="w-full space-y-4">
                {/* Summary strip */}
                <div className="w-full grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Logs', value: allLogs.length, color: 'text-purple-600' },
                    { label: 'Most Common', value: patterns?.topSymptoms[0] ? SYMPTOMS.find(s => s.id === patterns.topSymptoms[0])?.emoji + ' ' + patterns.topSymptoms[0] : '—', color: 'text-amber-600' },
                    { label: 'Avg Severity', value: patterns?.avgSeverity ? `${patterns.avgSeverity}/5` : '—', color: 'text-red-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="w-full bg-card border border-border rounded-2xl p-5 text-center">
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div className="w-full flex gap-2 flex-wrap">
                  {(['all', 'good', 'moderate', 'poor'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filter === f ? 'bg-purple-600 text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                      {f === 'all' ? 'All' : `${f} foods`}
                    </button>
                  ))}
                </div>

                {/* Empty state */}
                {allLogs.length === 0 && (
                  <div className="w-full bg-card rounded-3xl border border-border p-16 text-center flex flex-col items-center gap-4">
                    <Activity className="w-16 h-16 text-muted-foreground/30" />
                    <p className="text-lg font-semibold text-foreground">No symptom logs yet</p>
                    <p className="text-sm text-muted-foreground max-w-xs">After eating a food, log how you felt to discover your personal triggers</p>
                    <button onClick={() => setView('log')} className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 transition-colors">
                      Log Your First Symptom
                    </button>
                  </div>
                )}

                {/* Log cards */}
                <div className="w-full space-y-3">
                  {filtered.map(log => {
                    const isExpanded = expandedId === log.id;
                    const moodEmoji = MOODS.find(m => m.val === log.mood)?.emoji || '😐';
                    return (
                      <div key={log.id} className="w-full bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground">{log.foodName}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${RATING_COLORS[log.foodRating]}`}>{log.foodRating}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">{log.dateDisplay}</span>
                            <span className="text-xl">{moodEmoji}</span>
                          </div>
                        </div>

                        {log.symptoms.length > 0 && (
                          <div className="flex flex-wrap gap-2 my-3">
                            {log.symptoms.map(s => {
                              const sym = SYMPTOMS.find(x => x.id === s);
                              const isPos = POSITIVE_IDS.includes(s);
                              return (
                                <span key={s} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isPos ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : log.severity >= 4 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                                  {sym?.emoji} {sym?.label}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[1,2,3,4,5].map(d => (
                                <div key={d} className={`w-2 h-2 rounded-full ${d <= log.severity ? (log.severity >= 4 ? 'bg-red-500' : log.severity === 3 ? 'bg-amber-500' : 'bg-green-500') : 'bg-muted'}`} />
                              ))}
                            </div>
                            <span>Severity: {log.severity}/5</span>
                          </div>
                          <span>Appeared after: {log.timeAfterEating}</span>
                        </div>

                        {log.notes && (
                          <div>
                            <button onClick={() => setExpandedId(isExpanded ? null : log.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors">
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} Notes
                            </button>
                            {isExpanded && <div className="mt-2 bg-muted/50 rounded-xl p-3 text-sm text-foreground">{log.notes}</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ════════ INSIGHTS VIEW ════════ */}
            {view === 'insights' && (
              <div className="w-full">
                {allLogs.length < 3 ? (
                  <div className="w-full bg-card rounded-3xl border border-border p-16 text-center">
                    <p className="text-5xl mb-4">🧠</p>
                    <h2 className="text-xl font-bold text-foreground mb-2">Not enough data yet</h2>
                    <p className="text-muted-foreground text-sm mb-6">Log at least 3 symptom entries to unlock AI-powered pattern insights</p>
                    <div className="mb-6 max-w-xs mx-auto">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{allLogs.length} / 3 logs</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 mt-4 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${(allLogs.length / 3) * 100}%` }} />
                      </div>
                    </div>
                    <button onClick={() => setView('log')} className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 transition-colors">
                      Log a Symptom
                    </button>
                  </div>
                ) : (
                  <div className="w-full space-y-4">

                    {/* AI headline card */}
                    <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-3xl p-8 text-white">
                      <p className="text-white/70 text-xs tracking-wider mb-3 uppercase">🧠 AI Pattern Analysis</p>
                      <h2 className="text-2xl font-bold text-white">
                        {insightData?.headline || `${patterns?.totalLogs} symptom logs analyzed`}
                      </h2>
                      <p className="text-white/60 text-sm mt-2">Based on {patterns?.totalLogs} symptom logs</p>
                      <button onClick={generateAIInsights} disabled={isLoadingInsights}
                        className="mt-4 flex items-center gap-2 bg-white/20 text-white rounded-xl px-4 py-2 text-sm hover:bg-white/30 transition-colors disabled:opacity-60">
                        {isLoadingInsights ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Analyzing...</> : <><RefreshCw className="w-4 h-4" /> Generate Fresh Insights</>}
                      </button>
                    </div>

                    {/* Trigger + Safe foods */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-800 p-6">
                        <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3">⚠️ Your Trigger Foods</h3>
                        {patterns?.triggerFoods.length ? (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {patterns.triggerFoods.map(f => <span key={f} className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-sm"><X className="w-3 h-3" />{f}</span>)}
                          </div>
                        ) : <p className="text-sm text-red-600/70 dark:text-red-400/70 italic mb-3">No trigger foods identified yet</p>}
                        {insightData?.triggerPattern && <p className="text-sm text-red-700 dark:text-red-300">{insightData.triggerPattern}</p>}
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl border border-green-200 dark:border-green-800 p-6">
                        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">✅ Foods That Work For You</h3>
                        {patterns?.safeFoods.length ? (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {patterns.safeFoods.map(f => <span key={f} className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-sm"><CheckCircle className="w-3 h-3" />{f}</span>)}
                          </div>
                        ) : <p className="text-sm text-green-600/70 dark:text-green-400/70 italic mb-3">Keep logging to find your safe foods</p>}
                        {insightData?.safePattern && <p className="text-sm text-green-700 dark:text-green-300">{insightData.safePattern}</p>}
                      </div>
                    </div>

                    {/* Symptom frequency chart */}
                    <div ref={barsRef} className="bg-card rounded-3xl border border-border p-6">
                      <h3 className="font-semibold text-foreground mb-4">📊 Most Common Symptoms</h3>
                      {patterns?.topSymptoms.length ? patterns.topSymptoms.map((symId, i) => {
                        const sym = SYMPTOMS.find(s => s.id === symId);
                        const count = patterns.symptomCount[symId] || 0;
                        const pct = Math.round((count / allLogs.length) * 100);
                        return (
                          <div key={symId} className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-foreground">{sym?.emoji} {sym?.label || symId}</span>
                              <span className="text-muted-foreground">{count} times ({pct}%)</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out" style={{ width: barsVisible ? `${pct}%` : '0%', transitionDelay: `${i * 150}ms` }} />
                            </div>
                          </div>
                        );
                      }) : <p className="text-muted-foreground text-sm text-center py-4">No negative symptoms logged yet</p>}
                    </div>

                    {/* Recommendations */}
                    {insightData?.recommendations?.length > 0 && (
                      <div className="bg-card rounded-3xl border border-border p-6">
                        <h3 className="font-semibold text-foreground mb-4">💡 AI Recommendations</h3>
                        <div className="space-y-3">
                          {insightData.recommendations.map((rec: string, i: number) => (
                            <div key={i} className="flex gap-4 p-4 bg-muted/50 rounded-2xl">
                              <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
                              <p className="text-sm text-foreground">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Warning + Doctor note */}
                    {insightData?.warningSign && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 p-5">
                        <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ Watch Out For</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">{insightData.warningSign}</p>
                      </div>
                    )}
                    {insightData?.doctorNote && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 p-5">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">👨‍⚕️ When To See A Doctor</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{insightData.doctorNote}</p>
                      </div>
                    )}

                    {/* Prompt to generate if not yet */}
                    {!insightData && !isLoadingInsights && (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground text-sm mb-3">Click "Generate Fresh Insights" above to get AI-powered analysis</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
