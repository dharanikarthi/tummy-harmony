import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FoodEntry {
  id: number;
  foodName: string;
  rating: 'good' | 'moderate' | 'poor';
  explanation: string;
  alternatives: string[];
  tip: string;
  date: string;
}

interface UserState {
  userName: string;
  gutCondition: string;
  foodHistory: FoodEntry[];
  weeklyScore: number;
  isDarkMode: boolean;
}

interface UserContextType extends UserState {
  setUserName: (name: string) => void;
  setGutCondition: (condition: string) => void;
  addFoodEntry: (entry: FoodEntry) => void;
  setWeeklyScore: (score: number) => void;
  toggleDarkMode: () => void;
}

const defaultState: UserState = {
  userName: '',
  gutCondition: '',
  foodHistory: [],
  weeklyScore: 7,
  isDarkMode: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

function loadState(): UserState {
  try {
    const saved = localStorage.getItem('gutsense-state');
    if (saved) return { ...defaultState, ...JSON.parse(saved) };
  } catch {}
  return defaultState;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>(loadState);

  useEffect(() => {
    localStorage.setItem('gutsense-state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.isDarkMode);
  }, [state.isDarkMode]);

  const ctx: UserContextType = {
    ...state,
    setUserName: (userName) => setState((s) => ({ ...s, userName })),
    setGutCondition: (gutCondition) => setState((s) => ({ ...s, gutCondition })),
    addFoodEntry: (entry) => setState((s) => ({ ...s, foodHistory: [entry, ...s.foodHistory] })),
    setWeeklyScore: (weeklyScore) => setState((s) => ({ ...s, weeklyScore })),
    toggleDarkMode: () => setState((s) => ({ ...s, isDarkMode: !s.isDarkMode })),
  };

  return <UserContext.Provider value={ctx}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
