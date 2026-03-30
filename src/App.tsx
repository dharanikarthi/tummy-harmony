import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import PageLoadSpinner from "./components/PageLoadSpinner";

const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FoodChecker = lazy(() => import("./pages/FoodChecker"));
const HistoryPage = lazy(() => import("./pages/History"));
const WeeklyReport = lazy(() => import("./pages/WeeklyReport"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoadSpinner />}>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/check" element={<FoodChecker />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/report" element={<WeeklyReport />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
