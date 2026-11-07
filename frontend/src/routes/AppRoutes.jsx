import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";
import Loader from "../components/common/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const AIAssistant = lazy(() => import("../pages/AIAssistant.jsx"));
const Accounts = lazy(() => import("../pages/Accounts.jsx"));
const Assets = lazy(() => import("../pages/Assets.jsx"));
const Budgets = lazy(() => import("../pages/Budgets.jsx"));
const BusinessFinance = lazy(() => import("../pages/BusinessFinance.jsx"));
const Calculators = lazy(() => import("../pages/Calculators.jsx"));
const Dashboard = lazy(() => import("../pages/Dashboard.jsx"));
const Expenses = lazy(() => import("../pages/Expenses.jsx"));
const FamilyFinance = lazy(() => import("../pages/FamilyFinance.jsx"));
const FinancialGoals = lazy(() => import("../pages/FinancialGoals.jsx"));
const FinancialHealth = lazy(() => import("../pages/FinancialHealth.jsx"));
const Forecasting = lazy(() => import("../pages/Forecasting.jsx"));
const Income = lazy(() => import("../pages/Income.jsx"));
const Insurance = lazy(() => import("../pages/Insurance.jsx"));
const Investments = lazy(() => import("../pages/Investments.jsx"));
const Liabilities = lazy(() => import("../pages/Liabilities.jsx"));
const Loans = lazy(() => import("../pages/Loans.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const NetWorth = lazy(() => import("../pages/NetWorth.jsx"));
const Notifications = lazy(() => import("../pages/Notifications.jsx"));
const Register = lazy(() => import("../pages/Register.jsx"));
const Reports = lazy(() => import("../pages/Reports.jsx"));
const Retirement = lazy(() => import("../pages/Retirement.jsx"));
const Settings = lazy(() => import("../pages/Settings.jsx"));
const TaxManagement = lazy(() => import("../pages/TaxManagement.jsx"));
const Transactions = lazy(() => import("../pages/Transactions.jsx"));

function ProtectedRoutes() {
  const { user, loading, error } = useAuth();
  if (loading) return <Loader label="Loading your workspace" />;
  if (error && !user) return <main className="auth-page"><section className="auth-card"><h1>Can’t reach your workspace</h1><p>{error}</p><p className="muted">Check that the API is running, then refresh.</p></section></main>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader label="Loading your workspace" />;
  return user ? <Navigate to="/" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader label="Opening this section" />}>
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/liabilities" element={<Liabilities />} />
        <Route path="/net-worth" element={<NetWorth />} />
        <Route path="/financial-health" element={<FinancialHealth />} />
        <Route path="/goals" element={<FinancialGoals />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/tax-management" element={<TaxManagement />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/retirement" element={<Retirement />} />
        <Route path="/business-finance" element={<BusinessFinance />} />
        <Route path="/family-finance" element={<FamilyFinance />} />
        <Route path="/calculators" element={<Calculators />} />
        <Route path="/forecasting" element={<Forecasting />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}