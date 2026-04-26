import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, Upload, Search, X, RefreshCw, CheckCircle,
  Heart, Leaf, Utensils, Calendar, Activity,
  Camera, CameraOff, FlipHorizontal,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { foodSuggestions } from '@/data/foodSuggestions';
import { staggerDelay } from '@/utils/animations';
import { analyzeByImage } from '@/services/groqService';
import { analyzeGutHealth, type GutAnalysisResult } from '@/services/gutAnalysis';
import FoodSearchInput from '@/components/FoodSearchInput';

/* ── constants ─────────────────────────────────────────────── */
const ratingStyles = {
  good:     'border-good/30 bg-good/5',
  moderate: 'border-moderate/30 bg-moderate/5',
  poor:     'border-poor/30 bg-poor/5',
};
const ratingDot = { good: 'bg-good', moderate: 'bg-moderate', poor: 'bg-poor' };

const heroGradient = {
  good:     'from-green-600 to-teal-600',
  moderate: 'from-amber-500 to-orange-500',
  poor:     'from-red-600 to-rose-600',
};
const ratingBadge = {
  good:     '✓ GREAT CHOICE',
  moderate: '⚡ MODERATION',
  poor:     '✕ AVOID',
};
const gaugeColor = {
  good:     '#16a34a',
  moderate: '#d97706',
  poor:     '#dc2626',
};

const LOADING_STEPS = [
  'Reading your food...',
  'Identifying food item...',
  'Analyzing gut compatibility...',
  'Generating recommendations...',
];

/* ── Gauge SVG ──────────────────────────────────────────────── */
function DangerGauge({ rating, score }: { rating: 'good' | 'moderate' | 'poor'; score: number }) {
  const [offset, setOffset] = useState(251);
  const color = gaugeColor[rating];
  const targetOffset = 251 - (score / 10) * 251;

  // needle angle: poor=200°, moderate=270°, good=340°
  const angle = rating === 'good' ? 340 : rating === 'moderate' ? 270 : 200;
  const rad = (angle * Math.PI) / 180;
  const nx = 100 + 65 * Math.cos(rad);
  const ny = 100 + 65 * Math.sin(rad);

  useEffect(() => {
    const t = setTimeout(() => setOffset(targetOffset), 300);
    return () => clearTimeout(t);
  }, [targetOffset]);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" style={{ maxWidth: 220, width: '100%' }}>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--muted))" strokeWidth="16" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"
          strokeDasharray="251" strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1)' }} />
        <line x1="100" y1="100" x2={nx} y2={ny} stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round"
          style={{ transition: 'all 1.2s cubic-bezier(0.34,1.56,0.64,1)', transitionDelay: '200ms' }} />
        <circle cx="100" cy="100" r="6" fill={color} />
      </svg>
      <div className="flex justify-between w-full px-2 -mt-1 text-xs text-muted-foreground">
        <span>Poor</span><span>Moderate</span><span>Good</span>
      </div>
    </div>
  );
}

/* ── main component ─────────────────────────────────────────── */
export default function FoodChecker() {
  const [tab, setTab]               = useState<'upload' | 'camera' | 'type'>('type');
  const [foodInput, setFoodInput]   = useState('');
  const [image, setImage]           = useState<string | null>(null);
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [fileName, setFileName]     = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_STEPS[0]);
  const [loadingPct, setLoadingPct] = useState(0);
  const [result, setResult]         = useState<GutAnalysisResult | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [saved, setSaved]           = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const [showFullExplanation, setShowFullExplanation] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [barsVisible, setBarsVisible] = useState(false);
  // Camera state
  const [cameraStream, setCameraStream]         = useState<MediaStream | null>(null);
  const [cameraError, setCameraError]           = useState('');
  const [isCameraLoading, setIsCameraLoading]   = useState(false);
  const [capturedPhoto, setCapturedPhoto]       = useState<string | null>(null);
  const [facingMode, setFacingMode]             = useState<'environment' | 'user'>('environment');
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras]     = useState(false);
  const barRef    = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const {
    userName, gutCondition, allConditions, customCondition,
    age, bmi, bmiCategory, addFoodEntry,
  } = useUser();

  /* ── condition context ── */
  function buildConditionContext(): string {
    const profile = (() => {
      try { return JSON.parse(localStorage.getItem('gutsense_user') || '{}'); } catch { return {}; }
    })();
    const conditions = (allConditions?.length > 0 ? allConditions : profile?.allConditions)
      || [gutCondition || profile?.gutCondition || 'General digestive health'];
    const custom   = customCondition || profile?.customCondition || '';
    const userAge  = age  || profile?.age  || null;
    const userBmi  = bmi  || profile?.bmi  || null;
    const userBmiCat = bmiCategory || profile?.bmiCategory || null;
    let ctx = `The user has the following gut conditions: ${conditions.join(', ')}.`;
    if (custom)              ctx += ` Additional details: ${custom}.`;
    if (userAge)             ctx += ` The user is ${userAge} years old.`;
    if (userBmi && userBmiCat) ctx += ` Their BMI is ${userBmi} (${userBmiCat}).`;
    return ctx;
  }

  const hasCondition = !!(gutCondition || (() => {
    try { return JSON.parse(localStorage.getItem('gutsense_user') || '{}')?.gutCondition; } catch { return false; }
  })());

  /* ── score count-up ── */
  useEffect(() => {
    if (!result) return;
    setDisplayScore(0);
    let current = 0;
    const target = result.ratingScore || 5;
    const timer = setInterval(() => {
      current += 0.5;
      if (current >= target) { setDisplayScore(target); clearInterval(timer); }
      else setDisplayScore(Math.round(current * 10) / 10);
    }, 50);
    return () => clearInterval(timer);
  }, [result]);

  /* ── bar in-view observer ── */
  useEffect(() => {
    if (!barRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setBarsVisible(true); }, { threshold: 0.3 });
    obs.observe(barRef.current);
    return () => obs.disconnect();
  }, [result]);

  /* ── loading cycle ── */
  useEffect(() => {
    if (!isLoading) return;
    let i = 0; let pct = 0;
    const t = setInterval(() => {
      i = Math.min(i + 1, LOADING_STEPS.length - 1);
      pct = Math.min(pct + 22, 90);
      setLoadingStep(i); setLoadingMsg(LOADING_STEPS[i]); setLoadingPct(pct);
    }, 1800);
    return () => clearInterval(t);
  }, [isLoading]);

  /* ── analysis handlers ── */
  async function runAnalysis(foodName: string) {
    setIsLoading(true); setResult(null); setError(null);
    setSaved(false); setBarsVisible(false); setShowFullExplanation(false);
    setLoadingStep(0); setLoadingMsg(LOADING_STEPS[0]); setLoadingPct(5);
    try {
      const analysis = await analyzeGutHealth(foodName, buildConditionContext());
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please check your connection and try again.');
    } finally { setIsLoading(false); }
  }

  async function handleTextAnalyze(name?: string) {
    const query = (name || foodInput).trim();
    if (!query) return;
    await runAnalysis(query);
  }

  async function handleImageAnalyze() {
    if (!imageFile) return;
    setIsLoading(true); setResult(null); setError(null);
    setSaved(false); setBarsVisible(false); setShowFullExplanation(false);
    setLoadingStep(0); setLoadingMsg('Reading your food image...'); setLoadingPct(5);
    try {
      const identified = await analyzeByImage(imageFile, [gutCondition || "I'm Healthy"], userName || 'User');
      if (!identified || (identified.food_identified === false && !identified.food_name)) {
        setError("That doesn't look like a food image. Please upload a photo of food.");
        return;
      }
      const foodName = identified.food_name || 'Unknown food';
      setLoadingMsg(`Found: ${foodName}! Analyzing for your gut...`); setLoadingPct(50);
      const analysis = await analyzeGutHealth(foodName, buildConditionContext());
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally { setIsLoading(false); }
  }

  function handleTabSwitch(newTab: 'upload' | 'camera' | 'type') {
    if (tab === 'camera') { stopCamera(); setCapturedPhoto(null); setCameraError(''); }
    setTab(newTab); setImage(null); setImageFile(null);
    setFileName(''); setFoodInput(''); setError(null); setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  /* ── camera functions ── */
  function stopCamera() {
    if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); setCameraStream(null); }
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Your browser does not support camera access. Please use Chrome or Safari, or upload a photo instead.');
      return;
    }
    setIsCameraLoading(true); setCameraError(''); setCapturedPhoto(null);
    try {
      if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
      });
      setCameraStream(stream);
      // Don't set srcObject here — the <video> element may not be mounted yet.
      // The useEffect below handles it after React renders.
    } catch (err: any) {
      if (err.name === 'NotAllowedError') setCameraError('Camera access denied. Please allow camera permission in your browser settings and try again.');
      else if (err.name === 'NotFoundError') setCameraError('No camera found on this device.');
      else if (err.name === 'NotReadableError') setCameraError('Camera is already in use by another app. Close other apps and try again.');
      else setCameraError('Could not access camera. Try uploading a photo instead.');
    } finally { setIsCameraLoading(false); }
  }

  // Wire stream to video element AFTER React renders the <video> tag
  useEffect(() => {
    if (!cameraStream || !videoRef.current) return;
    videoRef.current.srcObject = cameraStream;
    videoRef.current.play().catch(() => {});
  }, [cameraStream]);

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current; const canvas = canvasRef.current;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
    stopCamera();
    fetch(dataUrl).then(r => r.blob()).then(blob => {
      setImageFile(new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' }));
    });
  }

  function flipCamera() {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    stopCamera();
    setTimeout(() => startCamera(), 300);
  }

  function retakePhoto() { setCapturedPhoto(null); setImageFile(null); startCamera(); }

  // Detect multiple cameras
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then(devices => {
      setHasMultipleCameras(devices.filter(d => d.kind === 'videoinput').length > 1);
    }).catch(() => setHasMultipleCameras(false));
  }, []);

  // Start/stop camera when tab changes
  useEffect(() => {
    if (tab !== 'camera') { stopCamera(); return; }
    navigator.permissions?.query({ name: 'camera' as PermissionName }).then(result => {
      if (result.state === 'granted') startCamera();
      else if (result.state === 'denied') setCameraError('Camera access denied. Please allow camera permission in your browser settings.');
      else setShowPermissionPrompt(true);
    }).catch(() => startCamera());
  }, [tab]);

  // Restart camera when facingMode changes
  useEffect(() => {
    if (tab === 'camera' && !capturedPhoto && cameraStream) startCamera();
  }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => { return () => stopCamera(); }, []);

  function handleClearImage() {
    setImage(null); setImageFile(null); setFileName(''); setError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleCheckAnother() {
    setResult(null); setImage(null); setImageFile(null);
    setFileName(''); setFoodInput(''); setError(null);
    setIsLoading(false); setSaved(false); setBarsVisible(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleFile(file: File) {
    setFileName(file.name); setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!result || saved) return;
    const entry = {
      id: Date.now(), foodName: result.foodName, rating: result.rating,
      explanation: result.explanation, alternatives: result.alternatives,
      tip: result.tip, date: new Date().toISOString(),
    };
    addFoodEntry({ ...entry, alternatives: [] });
    try {
      const existing = JSON.parse(localStorage.getItem('gutsense_user') || '{}');
      localStorage.setItem('gutsense_user', JSON.stringify({ ...existing, foodHistory: [entry, ...(existing.foodHistory || [])] }));
    } catch {}
    setSaved(true);
  }

  /* ── derived ── */
  const conditions = allConditions?.length > 0 ? allConditions : (gutCondition ? [gutCondition] : []);
  const shortExplanation = result?.explanation?.slice(0, 200) || '';
  const needsExpand = (result?.explanation?.length || 0) > 200;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-6">

          {/* ── INPUT AREA ── */}
          {!isLoading && !result && (
            <div className="p-4 lg:p-6 space-y-5">
              <div>
                <button onClick={() => navigate('/dashboard')} className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3">
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" /> Back
                </button>
                <h1 className="text-2xl font-bold text-foreground">Check a Food</h1>
                <p className="text-muted-foreground text-sm">Find out if this food is safe for your <span className="font-medium text-foreground">{gutCondition || 'gut'}</span></p>
              </div>

              {!hasCondition && (
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-300 dark:border-amber-700 p-4 flex items-center gap-3">
                  <span className="text-amber-600 text-xl shrink-0">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">No gut condition set</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">Analysis will be general. Set your condition for personalized results.</p>
                  </div>
                  <Link to="/profile" className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-medium hover:bg-amber-700 transition-colors shrink-0">Set Condition</Link>
                </div>
              )}

              <div className="bg-muted rounded-2xl p-1 flex relative">
                <div className="absolute top-1 bottom-1 bg-card shadow-sm rounded-xl transition-all duration-300"
                  style={{ width: '33.33%', left: tab === 'upload' ? '0%' : tab === 'camera' ? '33.33%' : '66.66%' }} />
                {([
                  { id: 'upload', icon: <Upload className="w-4 h-4" />, label: 'Upload' },
                  { id: 'camera', icon: <Camera className="w-4 h-4" />, label: 'Camera' },
                  { id: 'type',   icon: <Search className="w-4 h-4" />,  label: 'Type Name' },
                ] as const).map(({ id, icon, label }) => (
                  <button key={id} onClick={() => handleTabSwitch(id)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 relative z-10 flex items-center justify-center gap-1.5 ${tab === id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    {icon}{label}
                    {id === 'camera' && cameraStream && (
                      <span className="flex items-center gap-1 ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] text-red-500 font-bold">LIVE</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── UPLOAD TAB ── */}
              {tab === 'upload' && (
                <>
                  <div onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false); }}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                    className={`min-h-[16rem] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative overflow-hidden ${dragOver ? 'border-primary bg-primary/5 scale-[1.02]' : image ? 'border-border' : 'border-border hover:border-primary/50'}`}>
                    {image ? (
                      <>
                        <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <button onClick={(e) => { e.stopPropagation(); handleClearImage(); }} className="absolute top-3 right-3 w-8 h-8 bg-poor/90 backdrop-blur rounded-full flex items-center justify-center z-10 hover:scale-110 hover:rotate-90 transition-all duration-200">
                          <X className="w-4 h-4 text-poor-foreground" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-primary mb-3" />
                        <p className="font-medium text-foreground">{dragOver ? 'Release to analyze!' : 'Drop your food photo here'}</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                  {fileName && <p className="text-xs text-muted-foreground mt-2">{fileName}</p>}
                  <button disabled={!image} onClick={handleImageAnalyze} className="mt-4 w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Analyze This Food
                  </button>
                </>
              )}

              {/* ── CAMERA TAB ── */}
              {tab === 'camera' && (
                <div className="space-y-4">
                  {/* Permission prompt */}
                  {showPermissionPrompt && !cameraStream && !cameraError && !isCameraLoading && (
                    <div className="rounded-3xl border-2 border-dashed border-teal-300 dark:border-teal-800 p-10 flex flex-col items-center gap-5 text-center">
                      <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                        <Camera className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Allow Camera Access</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">GutSense needs your camera to photograph food for instant gut health analysis. Your photos are never stored or shared.</p>
                      </div>
                      <button onClick={() => { setShowPermissionPrompt(false); startCamera(); }}
                        className="w-full bg-teal-600 text-white rounded-2xl py-3.5 font-semibold hover:bg-teal-700 transition-colors">
                        Enable Camera
                      </button>
                      <button onClick={() => handleTabSwitch('upload')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Or upload a photo instead
                      </button>
                    </div>
                  )}

                  {/* Loading */}
                  {isCameraLoading && (
                    <div className="h-72 md:h-80 rounded-3xl bg-gray-950 flex flex-col items-center justify-center gap-4">
                      <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-white/70 text-sm">Starting camera...</p>
                    </div>
                  )}

                  {/* Error */}
                  {cameraError && (
                    <div className="rounded-3xl border-2 border-dashed border-border p-10 flex flex-col items-center gap-4 text-center">
                      <CameraOff className="w-12 h-12 text-muted-foreground/40" />
                      <p className="text-sm text-foreground font-medium">{cameraError}</p>
                      <div className="flex gap-3">
                        <button onClick={() => { setCameraError(''); startCamera(); }}
                          className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors">
                          Try Again
                        </button>
                        <button onClick={() => handleTabSwitch('upload')}
                          className="px-5 py-2.5 border border-border text-foreground rounded-xl text-sm hover:bg-muted transition-colors">
                          Upload Instead
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Live camera view */}
                  {cameraStream && !capturedPhoto && !isCameraLoading && (
                    <div className="relative rounded-3xl overflow-hidden bg-black h-72 md:h-80">
                      <video ref={videoRef} autoPlay playsInline muted
                        className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />

                      {/* Corner guides */}
                      {[['top-3 left-3 border-t-2 border-l-2','rounded-tl-lg'],['top-3 right-3 border-t-2 border-r-2','rounded-tr-lg'],['bottom-3 left-3 border-b-2 border-l-2','rounded-bl-lg'],['bottom-3 right-3 border-b-2 border-r-2','rounded-br-lg']].map(([pos, r], i) => (
                        <div key={i} className={`absolute ${pos} ${r} w-6 h-6 border-white/80`} />
                      ))}

                      {/* Scan line */}
                      <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-teal-400/70 animate-bounce"
                        style={{ boxShadow: '0 0 8px 2px rgba(45,212,191,0.5)' }} />

                      {/* Live indicator */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-white text-xs font-bold">LIVE</span>
                      </div>

                      {/* Flip button */}
                      {hasMultipleCameras && (
                        <button onClick={flipCamera}
                          className="absolute top-3 right-3 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                          <FlipHorizontal className="w-4 h-4 text-white" />
                        </button>
                      )}

                      {/* Bottom controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-5 flex items-center justify-center gap-8">
                        <button onClick={() => handleTabSwitch('upload')} className="text-white/70 text-xs hover:text-white transition-colors">
                          Upload instead
                        </button>
                        <button onClick={capturePhoto}
                          style={{ touchAction: 'manipulation' }}
                          className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg">
                          <div className="w-12 h-12 rounded-full bg-teal-600" />
                        </button>
                        <span className="text-white/70 text-xs capitalize">{facingMode === 'environment' ? 'Back' : 'Front'}</span>
                      </div>
                    </div>
                  )}

                  {/* Captured photo */}
                  {capturedPhoto && (
                    <div className="relative rounded-3xl overflow-hidden h-72 md:h-80">
                      <img src={capturedPhoto} alt="Captured food" className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-4 flex items-center justify-center gap-4">
                        <button onClick={retakePhoto}
                          className="px-5 py-2 rounded-xl border border-white/50 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                          Retake
                        </button>
                        <button onClick={handleImageAnalyze}
                          className="px-5 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" /> Analyze Photo
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hidden canvas for capture */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {/* ── TEXT TAB ── */}
              {tab === 'type' && (
                <>
                  <FoodSearchInput
                    value={foodInput}
                    onChange={setFoodInput}
                    onSelect={(name) => handleTextAnalyze(name)}
                    placeholder="e.g. Biryani, Curd Rice, Coffee, Idli..."
                  />
                  <button disabled={!foodInput.trim()} onClick={() => handleTextAnalyze()} className="mt-4 w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-semibold disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                    Analyze This Food
                  </button>
                  <div className="mt-6">
                    <h3 className="font-semibold text-foreground mb-3">Popular Indian Foods</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {foodSuggestions.map((food, i) => (
                        <button key={food.name} onClick={() => { setFoodInput(food.name); handleTextAnalyze(food.name); }}
                          className={`relative rounded-2xl overflow-hidden border-2 ${ratingStyles[food.rating]} hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 group`}
                          style={staggerDelay(i, 40)}>
                          <div className="aspect-square overflow-hidden">
                            <img src={food.image} alt={food.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-2.5">
                            <p className="text-white font-semibold text-sm drop-shadow-lg">{food.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className={`w-2 h-2 rounded-full ${ratingDot[food.rating]}`} />
                              <span className="text-white/80 text-xs capitalize">{food.rating}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {error && <div className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-center text-sm">{error}</div>}
            </div>
          )}


          {/* ── LOADING ── */}
          {isLoading && (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-background p-6">
              <div className="bg-card rounded-3xl border border-border p-10 max-w-sm w-full flex flex-col items-center gap-6 text-center">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full border-4 border-teal-200 dark:border-teal-800 animate-ping opacity-30" />
                  <div className="absolute inset-2 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">🔍</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-1 transition-all duration-300">{loadingMsg}</h3>
                  <p className="text-sm text-muted-foreground">Checking against your gut condition profile...</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="h-full bg-teal-600 rounded-full transition-all duration-300" style={{ width: `${loadingPct}%` }} />
                </div>
                <div className="bg-teal-50 dark:bg-teal-950/30 rounded-full px-5 py-2 text-sm text-teal-700 dark:text-teal-300 flex items-center gap-2">
                  Personalizing for <strong>{gutCondition || 'your condition'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* ── RESULT ── */}
          {result && !isLoading && (
            <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-4">

              {/* 1 — Hero card */}
              <div className={`rounded-3xl p-8 text-white relative overflow-hidden bg-gradient-to-br ${heroGradient[result.rating]}`}>
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white opacity-10" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white opacity-5" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-white/70 text-xs tracking-widest mb-1 uppercase">Food Identified</p>
                      <h2 className="text-4xl font-bold text-white">{result.foodName}</h2>
                    </div>
                    <span className="bg-white/20 backdrop-blur rounded-full px-5 py-2 text-white font-bold text-sm shrink-0">
                      {ratingBadge[result.rating]}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mt-6 flex-wrap gap-4">
                    <div>
                      <p className="text-white/70 text-sm">Gut Score</p>
                      <div className="flex items-end gap-1">
                        <span className="text-6xl font-bold text-white leading-none">{displayScore}</span>
                        <span className="text-white/60 text-2xl mb-1">/10</span>
                      </div>
                    </div>
                    {conditions.length > 0 && (
                      <div className="text-right">
                        <p className="text-white/70 text-xs mb-1">Checked for</p>
                        {conditions.map((c) => <p key={c} className="text-white/90 text-sm font-medium">{c}</p>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2 — Gauge + Quick stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-3xl border border-border p-6 flex flex-col items-center">
                  <p className="text-sm font-medium text-muted-foreground mb-4">Safety Meter</p>
                  <DangerGauge rating={result.rating} score={result.ratingScore} />
                  <p className="text-xl font-bold mt-3" style={{ color: gaugeColor[result.rating] }}>
                    {result.rating === 'good' ? 'Safe to Eat' : result.rating === 'moderate' ? 'Eat with Caution' : 'Avoid This'}
                  </p>
                </div>
                <div className="bg-card rounded-3xl border border-border p-6">
                  <p className="text-sm font-medium text-muted-foreground mb-4">Quick Stats</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <Heart className="w-5 h-5 text-teal-600" />, value: `${result.ratingScore}/10`, label: 'Gut Score' },
                      { icon: <Leaf className="w-5 h-5 text-green-600" />, value: result.nutrients?.find(n => n.name.toLowerCase().includes('fiber'))?.impact === 'positive' ? '✓ Good' : result.nutrients?.find(n => n.name.toLowerCase().includes('fiber'))?.impact === 'negative' ? '✗ Bad' : '—', label: 'Fiber' },
                      { icon: <Utensils className="w-5 h-5 text-blue-600" />, value: result.portionAdvice?.split(' ').slice(0, 2).join(' ') || '—', label: 'Portion' },
                      { icon: <Calendar className="w-5 h-5 text-purple-600" />, value: result.rating === 'poor' ? 'Avoid' : result.portionAdvice?.match(/\d+x/i)?.[0] || 'Moderate', label: 'Frequency' },
                    ].map((s, i) => (
                      <div key={i} className="bg-muted/50 rounded-2xl p-4 flex flex-col items-center text-center" style={{ animationDelay: `${i * 100}ms` }}>
                        {s.icon}
                        <p className="font-bold text-foreground text-sm mt-2">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3 — Explanation */}
              <div className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden">
                <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full" style={{ backgroundColor: gaugeColor[result.rating] }} />
                <p className="text-xs text-muted-foreground mb-2 ml-3">Why?</p>
                <p className="text-sm text-foreground leading-relaxed ml-3">
                  {showFullExplanation ? result.explanation : shortExplanation}
                  {needsExpand && !showFullExplanation && '...'}
                </p>
                {needsExpand && (
                  <button onClick={() => setShowFullExplanation(v => !v)} className="text-teal-600 text-xs mt-2 ml-3 cursor-pointer hover:underline">
                    {showFullExplanation ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>

              {/* 4 — Nutrients bar chart */}
              <div ref={barRef} className="bg-card rounded-3xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">🧪 Key Nutrients</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Positive</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Negative</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> Neutral</span>
                  </div>
                </div>
                {result.nutrients?.length > 0 ? (
                  <div className="space-y-4">
                    {result.nutrients.map((n, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{n.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${n.impact === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : n.impact === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                            {n.impact === 'positive' ? '↑ Good' : n.impact === 'negative' ? '↓ Avoid' : '→ Neutral'}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ease-out ${n.impact === 'positive' ? 'bg-green-500' : n.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'}`}
                            style={{ width: barsVisible ? (n.impact === 'positive' ? '75%' : n.impact === 'negative' ? '85%' : '50%') : '0%', transitionDelay: `${i * 150}ms` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">Nutrient analysis not available for this food</p>
                )}
              </div>

              {/* 5 — Portion + Avoid row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 p-5">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">🍽️ Portion Guide</h4>
                  <div className="flex items-center justify-center my-4">
                    <div className="relative w-24 h-24 rounded-full border-4 border-blue-300 dark:border-blue-700 flex items-center justify-center bg-blue-100 dark:bg-blue-900/40">
                      <div className={`absolute rounded-full bg-blue-400 dark:bg-blue-600 transition-all duration-1000 ease-out ${result.rating === 'good' ? 'w-20 h-20' : result.rating === 'moderate' ? 'w-14 h-14' : 'w-4 h-4'}`} />
                      <span className="relative z-10 text-2xl">{result.rating === 'poor' ? '🚫' : '🍽️'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 text-center font-medium">{result.portionAdvice || 'Moderate portions'}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-800 p-5">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3">⚠️ Avoid Combining With</h4>
                  {result.avoidWith?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.avoidWith.map((item, i) => (
                        <span key={i} className="flex items-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl text-sm">
                          <X className="w-3 h-3" />{item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-red-600/70 dark:text-red-400/70 italic mt-2">No specific combinations to avoid</p>
                  )}
                </div>
              </div>

              {/* 6 — Alternatives */}
              {(result.rating === 'moderate' || result.rating === 'poor') && result.alternatives?.length > 0 && (
                <div className="bg-card rounded-3xl border border-border p-6">
                  <h4 className="font-semibold text-foreground mb-4">✨ Better Alternatives for You</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {result.alternatives.map((alt, i) => (
                      <button key={i} onClick={() => { setFoodInput(alt); setResult(null); handleTextAnalyze(alt); }}
                        className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 cursor-pointer hover:scale-[1.03] hover:shadow-md transition-all duration-200"
                        style={{ animationDelay: `${i * 100}ms` }}>
                        <Leaf className="w-8 h-8 text-teal-600" />
                        <p className="font-semibold text-sm text-foreground">{alt}</p>
                        <p className="text-xs text-teal-600">Better choice</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 7 — Tip */}
              {result.tip && (
                <div className="bg-moderate/10 rounded-2xl p-4 flex gap-3 items-start">
                  <span className="text-xl shrink-0">💡</span>
                  <p className="text-sm text-foreground">{result.tip}</p>
                </div>
              )}

              {/* 8 — Actions */}
              <div className="flex gap-3 pb-4">
                <button onClick={handleSave} disabled={saved}
                  className={`flex-1 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white border-2 border-green-500' : 'border-2 border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30'}`}>
                  {saved ? <><CheckCircle className="w-5 h-5" /> Saved to History!</> : 'Save to History'}
                </button>
                <button onClick={handleCheckAnother} className="flex-1 py-4 rounded-2xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5" /> Check Another Food
                </button>
              </div>

              {/* Log symptoms button */}
              <button
                onClick={() => {
                  sessionStorage.setItem('pending_symptom_food', JSON.stringify({
                    foodName: result.foodName,
                    foodRating: result.rating,
                    date: new Date().toISOString(),
                  }));
                  navigate('/symptoms?log=new');
                }}
                className="w-full py-4 rounded-2xl border-2 border-purple-500 text-purple-600 font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all flex items-center justify-center gap-2 mb-8"
              >
                <Activity className="w-5 h-5" /> Log How You Felt After Eating
              </button>

            </div>
          )}

          {/* Error outside loading */}
          {error && !isLoading && !result && (
            <div className="p-6">
              <div className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-center text-sm">{error}</div>
            </div>
          )}

        </div>
      </div>
      <BottomNav />
    </div>
  );
}
