/**
 * Main App Component
 * Root component with authentication flow and role-based dashboards
 */

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Pages
import LandingPage from "./pages/LandingPage";
import NewLoginPage from "./pages/NewLoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

/**
 * Main Application Content (with auth)
 */
function AppContent() {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    logout,
    login,
  } = useAuth();

  // View state: 'landing', 'login', 'register', 'dashboard'
  const [currentView, setCurrentView] = useState("landing");

  // Update view when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView("dashboard");
    }
  }, [isAuthenticated]);

  /**
   * Handle login
   */
  const handleLogin = async (email, password, role) => {
    const result = await login(email, password);
    if (result.success) {
      setCurrentView("dashboard");
    }
    return result;
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    setCurrentView("landing");
  };

  // Show loading screen during initial auth check
  if (authLoading) {
    return (
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Loading Pulse.ai...
          </p>
        </div>
      </div>
    );
  }

  // If authenticated, show appropriate dashboard based on role
  if (isAuthenticated && user) {
    // Show doctor dashboard for doctors
    if (user.role === "doctor") {
      return <DoctorDashboard user={user} onLogout={handleLogout} />;
    }

    // Show patient dashboard for patients
    if (user.role === "patient") {
      return <PatientDashboard user={user} onLogout={handleLogout} />;
    }

    // Show admin dashboard for admins
    if (user.role === "admin") {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }
  }

  // Show public pages when not authenticated
  if (
    currentView === "landing" ||
    (!isAuthenticated && currentView !== "login" && currentView !== "register")
  ) {
    return <LandingPage onLoginClick={() => setCurrentView("login")} />;
  }

  if (currentView === "login") {
    return (
      <NewLoginPage
        onLogin={handleLogin}
        onSwitchToRegister={() => setCurrentView("register")}
      />
    );
  }

  if (currentView === "register") {
    return <RegisterPage onSwitchToLogin={() => setCurrentView("login")} />;
  }

  // Fallback to landing page
  return <LandingPage onLoginClick={() => setCurrentView("login")} />;
}

/**
 * App wrapper with AuthProvider and ThemeProvider
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
