/**
 * Main App Component
 * Root component with authentication flow and role-based dashboards
 */

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Pages
import LandingPage from "./pages/LandingPage";
import NewLoginPage from "./pages/NewLoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

/**
 * Loading Screen Component
 */
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-colors duration-300">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4 animate-pulse">
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M22 12h-4l-3 9L9 3l-3 9H2"
          />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-300 font-medium">
        Loading PulseConnect...
      </p>
    </div>
  </div>
);

/**
 * Protected Route Component - Redirects to login if not authenticated
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === "patient")
      return <Navigate to="/dashboard/patient" replace />;
    if (user?.role === "doctor")
      return <Navigate to="/dashboard/doctor" replace />;
    if (user?.role === "admin")
      return <Navigate to="/dashboard/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Public Route Component - Redirects to dashboard if authenticated
 */
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "patient")
      return <Navigate to="/dashboard/patient" replace />;
    if (user.role === "doctor")
      return <Navigate to="/dashboard/doctor" replace />;
    if (user.role === "admin")
      return <Navigate to="/dashboard/admin" replace />;
  }

  return children;
};

/**
 * Landing Page Wrapper
 */
const LandingPageWrapper = () => {
  const navigate = useNavigate();
  return <LandingPage onLoginClick={() => navigate("/login")} />;
};

/**
 * Login Page Wrapper
 */
const LoginPageWrapper = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email, password, role) => {
    const result = await login(email, password);
    if (result.success) {
      // Navigation will be handled by PublicRoute redirect
    }
    return result;
  };

  return (
    <NewLoginPage
      onLogin={handleLogin}
      onSwitchToRegister={() => navigate("/register")}
    />
  );
};

/**
 * Register Page Wrapper
 */
const RegisterPageWrapper = () => {
  const navigate = useNavigate();
  return <RegisterPage onSwitchToLogin={() => navigate("/login")} />;
};

/**
 * Patient Dashboard Wrapper
 */
const PatientDashboardWrapper = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return <PatientDashboard user={user} onLogout={handleLogout} />;
};

/**
 * Doctor Dashboard Wrapper
 */
const DoctorDashboardWrapper = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return <DoctorDashboard user={user} onLogout={handleLogout} />;
};

/**
 * Admin Dashboard Wrapper
 */
const AdminDashboardWrapper = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return <AdminDashboard user={user} onLogout={handleLogout} />;
};

/**
 * App wrapper with Router, AuthProvider and ThemeProvider
 */
function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPageWrapper />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPageWrapper />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPageWrapper />
                </PublicRoute>
              }
            />

            {/* Email verification and password reset */}
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard/patient"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientDashboardWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorDashboardWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboardWrapper />
                </ProtectedRoute>
              }
            />

            {/* Generic dashboard redirect */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

/**
 * Dashboard Redirect Component - redirects to appropriate dashboard
 */
const DashboardRedirect = () => {
  const { user } = useAuth();

  if (user?.role === "patient")
    return <Navigate to="/dashboard/patient" replace />;
  if (user?.role === "doctor")
    return <Navigate to="/dashboard/doctor" replace />;
  if (user?.role === "admin") return <Navigate to="/dashboard/admin" replace />;
  return <Navigate to="/" replace />;
};

export default App;
