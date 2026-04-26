import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FoodEntry {
  id: number;
  foodName: string;
  rating: 'good' | 'moderate' | 'poor';
  explanation: string;
  alternatives: string[];
  tip: string;
  date: string;
}

export interface SymptomLog {
  id: number;
  foodName: string;
  foodRating: 'good' | 'moderate' | 'poor';
  symptoms: string[];
  severity: 1 | 2 | 3 | 4 | 5;
  timeAfterEating: string;
  notes: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  date: string;
  dateDisplay: string;
}

interface UserState {
  userName: string;
  userEmail: string;
  gutCondition: string;
  allConditions: string[];
  customCondition: string;
  foodHistory: FoodEntry[];
  weeklyScore: number;
  isDarkMode: boolean;
  age: number | null;
  gender: string;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  bmiCategory: string;
  healthGoals: string[];
  setupCompleted: boolean;
  symptomLogs: SymptomLog[];
}

interface UserContextType extends UserState {
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setGutCondition: (condition: string) => void;
  setAllConditions: (conditions: string[]) => void;
  setCustomCondition: (val: string) => void;
  addFoodEntry: (entry: FoodEntry) => void;
  setWeeklyScore: (score: number) => void;
  toggleDarkMode: () => void;
  setAge: (age: number | null) => void;
  setGender: (gender: string) => void;
  setHeight: (height: number | null) => void;
  setWeight: (weight: number | null) => void;
  setBmi: (bmi: number | null) => void;
  setBmiCategory: (cat: string) => void;
  setHealthGoals: (goals: string[]) => void;
  setSetupCompleted: (v: boolean) => void;
  addSymptomLog: (log: SymptomLog) => void;
  logout: () => void;
}

const defaultState: UserState = {
  userName: '',
  userEmail: '',
  gutCondition: '',
  allConditions: [],
  customCondition: '',
  foodHistory: [],
  weeklyScore: 7,
  isDarkMode: false,
  age: null,
  gender: '',
  height: null,
  weight: null,
  bmi: null,
  bmiCategory: '',
  healthGoals: [],
  setupCompleted: false,
  symptomLogs: [],
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'gutsense_user';

function loadState(): UserState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultState;
    const u = JSON.parse(saved);
    // If user is logged out, return empty context (no name/email)
    // but keep isDarkMode preference
    if (u.loggedOut === true) {
      return { ...defaultState, isDarkMode: u.isDarkMode || false };
    }
    return {
      ...defaultState,
      userName:       u.name        || '',
      userEmail:      u.email       || '',
      gutCondition:   u.gutCondition|| '',
      allConditions:  u.allConditions || [],
      customCondition:u.customCondition || '',
      foodHistory:    u.foodHistory || [],
      weeklyScore:    u.weeklyScore || 7,
      isDarkMode:     u.isDarkMode  || false,
      age:            u.age         ?? null,
      gender:         u.gender      || '',
      height:         u.height      ?? null,
      weight:         u.weight      ?? null,
      bmi:            u.bmi         ?? null,
      bmiCategory:    u.bmiCategory || '',
      healthGoals:    u.goals       || u.healthGoals || [],
      setupCompleted: u.setupCompleted || false,
      symptomLogs:    u.symptomLogs || [],
    };
  } catch {
    return defaultState;
  }
}

function persistState(state: UserState) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...existing,
      name:            state.userName,
      email:           state.userEmail,
      gutCondition:    state.gutCondition,
      allConditions:   state.allConditions,
      customCondition: state.customCondition,
      foodHistory:     state.foodHistory,
      weeklyScore:     state.weeklyScore,
      isDarkMode:      state.isDarkMode,
      age:             state.age,
      gender:          state.gender,
      height:          state.height,
      weight:          state.weight,
      bmi:             state.bmi,
      bmiCategory:     state.bmiCategory,
      goals:           state.healthGoals,
      setupCompleted:  state.setupCompleted,
      symptomLogs:     state.symptomLogs,
      // preserve auth fields
      loggedOut:       existing.loggedOut ?? false,
    }));
  } catch {}
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>(loadState);
  const [initialized, setInitialized] = useState(false);
  const [skipPersist, setSkipPersist] = useState(false);

  useEffect(() => {
    if (!initialized) { setInitialized(true); return; }
    if (skipPersist) { setSkipPersist(false); return; }
    persistState(state);
  }, [state, initialized, skipPersist]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.isDarkMode);
  }, [state.isDarkMode]);

  const set = <K extends keyof UserState>(key: K) => (val: UserState[K]) =>
    setState((s) => ({ ...s, [key]: val }));

  const ctx: UserContextType = {
    ...state,
    setUserName:      set('userName'),
    setUserEmail:     set('userEmail'),
    setGutCondition:  set('gutCondition'),
    setAllConditions: set('allConditions'),
    setCustomCondition: set('customCondition'),
    addFoodEntry: (entry) => setState((s) => ({ ...s, foodHistory: [entry, ...s.foodHistory] })),
    setWeeklyScore:   set('weeklyScore'),
    toggleDarkMode:   () => setState((s) => ({ ...s, isDarkMode: !s.isDarkMode })),
    setAge:           set('age'),
    setGender:        set('gender'),
    setHeight:        set('height'),
    setWeight:        set('weight'),
    setBmi:           set('bmi'),
    setBmiCategory:   set('bmiCategory'),
    setHealthGoals:   set('healthGoals'),
    setSetupCompleted: set('setupCompleted'),
    addSymptomLog: (log) => setState((s) => ({ ...s, symptomLogs: [log, ...s.symptomLogs] })),
    logout: () => {
      // Mark logged out in localStorage but KEEP all setup/health data intact
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, loggedOut: true }));
      } catch {}
      // Reset context to empty — skip the persist so we don't overwrite localStorage
      setSkipPersist(true);
      setState({ ...defaultState, isDarkMode: state.isDarkMode });
    },
  };

  return <UserContext.Provider value={ctx}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
