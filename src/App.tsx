import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./context/UserContext";
import PageLoadSpinner from "./components/PageLoadSpinner";
import ToastContainer from "./components/Toast";
import InstallPrompt from "./components/InstallPrompt";

const AuthPage     = lazy(() => import("./pages/AuthPage"));
const HealthSetup  = lazy(() => import("./pages/HealthSetup"));
const Dashboard    = lazy(() => import("./pages/Dashboard"));
const FoodChecker  = lazy(() => import("./pages/FoodChecker"));
const HistoryPage  = lazy(() => import("./pages/History"));
const WeeklyReport = lazy(() => import("./pages/WeeklyReport"));
const Profile      = lazy(() => import("./pages/Profile"));
const SymptomTracker = lazy(() => import("./pages/SymptomTracker"));
const MealPlanGenerator = lazy(() => import("./pages/MealPlanGenerator"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const NotFound     = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// All guards use UserContext (reactive) so they respond to login/logout instantly
function AuthRoute() {
  const { userName, userEmail, setupCompleted } = useUser();
  const loggedIn = !!(userName && userEmail);
  if (loggedIn) return <Navigate to={setupCompleted ? "/dashboard" : "/setup"} replace />;
  return <AuthPage />;
}

function SetupRoute() {
  const { userName, userEmail, setupCompleted } = useUser();
  if (!userName || !userEmail) return <Navigate to="/" replace />;
  // Already done setup — go to dashboard
  if (setupCompleted) return <Navigate to="/dashboard" replace />;
  return <HealthSetup />;
}

function DashboardRoute() {
  const { userName, userEmail, setupCompleted } = useUser();
  if (!userName || !userEmail) return <Navigate to="/" replace />;
  if (!setupCompleted) return <Navigate to="/setup" replace />;
  return <Dashboard />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userName, userEmail, setupCompleted } = useUser();
  if (!userName || !userEmail) return <Navigate to="/" replace />;
  if (!setupCompleted) return <Navigate to="/setup" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <BrowserRouter>
        <ToastContainer />
        <InstallPrompt />
        <Suspense fallback={<PageLoadSpinner />}>
          <Routes>
            <Route path="/"          element={<AuthRoute />} />
            <Route path="/setup"     element={<SetupRoute />} />
            <Route path="/dashboard" element={<DashboardRoute />} />
            <Route path="/check"     element={<ProtectedRoute><FoodChecker /></ProtectedRoute>} />
            <Route path="/history"   element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/report"    element={<ProtectedRoute><WeeklyReport /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/symptoms"  element={<ProtectedRoute><SymptomTracker /></ProtectedRoute>} />
            <Route path="/mealplan"  element={<ProtectedRoute><MealPlanGenerator /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
            <Route path="*"          element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
