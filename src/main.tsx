import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Pre-seed the hardcoded user if not already present
const VALID_EMAIL = 'dharanik269@gmail.com';
const VALID_PASS  = 'pink4pug';
const KEY = 'gutsense_user';

const existing = localStorage.getItem(KEY);
if (!existing) {
  localStorage.setItem(KEY, JSON.stringify({
    name: 'Dharani',
    email: VALID_EMAIL,
    password: VALID_PASS,
    createdAt: new Date().toISOString(),
    gutCondition: '',
    allConditions: [],
    customCondition: '',
    height: null,
    weight: null,
    bmi: null,
    age: null,
    gender: '',
    goals: [],
    setupCompleted: false,
    loggedOut: true,
  }));
}

createRoot(document.getElementById("root")!).render(<App />);
