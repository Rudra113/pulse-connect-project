/**
 * Updated Login Page Component
 * Login with role selection (Patient, Doctor, Admin)
 */

import React, { useState } from "react";
import { Heart, Shield, Users, Star, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function LoginPage({ onLogin, onSwitchToRegister }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [role, setRole] = useState("patient");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await onLogin(formData.email, formData.password, role);
      if (!result.success) {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Left Side - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-blue-600 dark:from-teal-700 dark:to-blue-800 p-12 flex-col justify-between">
        <div className="flex items-center space-x-2 text-white">
          <Heart className="w-10 h-10" />
          <span className="text-3xl font-bold">Pulse.ai</span>
        </div>
        <div className="text-white">
          <h2 className="text-4xl font-bold mb-4">Welcome back!</h2>
          <p className="text-xl text-teal-100">
            Your health journey continues here.
          </p>
        </div>
        <div className="flex items-center space-x-4 text-white text-sm">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Secure</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>50k+ Users</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>4.9 Rating</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900 transition-colors duration-300 relative">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <Heart className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Pulse.ai
            </span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Sign In
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Choose your role to continue
          </p>

          {/* Role Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-8">
            {["patient", "doctor", "admin"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-3 rounded-lg font-medium transition capitalize ${
                  role === r
                    ? "bg-white dark:bg-gray-700 shadow-md text-teal-600 dark:text-teal-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 dark:bg-teal-500 text-white py-3 rounded-xl hover:bg-teal-700 dark:hover:bg-teal-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Signing in..."
                : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
