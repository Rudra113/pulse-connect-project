/**
 * Navbar Component
 * Accessible navigation bar with dark mode toggle
 * Responsive: hamburger on < lg (1024px), full nav on lg+
 */

import React, { useState, useEffect } from "react";
import { Activity, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const Navbar = ({ onLoginClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  // Close mobile menu on resize to lg+
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo — clicking navigates to home */}
          <a href="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              PulseConnect
            </span>
          </a>

          {/* Desktop Navigation — lg+ only */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <a
              href="#features"
              className="text-base xl:text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors py-2"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-base xl:text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors py-2"
            >
              How it Works
            </a>
            <a
              href="#about"
              className="text-base xl:text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors py-2"
            >
              About
            </a>
            <a
              href="#symptom-checker"
              className="text-base xl:text-lg font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors py-2"
            >
              Try AI Symptom Checker
            </a>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 xl:w-6 xl:h-6 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 xl:w-6 xl:h-6 text-gray-700" />
              )}
            </button>

            <button
              onClick={onLoginClick}
              className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 xl:px-8 py-2.5 xl:py-3 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all text-base xl:text-lg font-semibold shadow-lg shadow-teal-500/25"
            >
              Login
            </button>
          </div>

          {/* Mobile/Tablet controls — below lg only */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <button
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu — inline dropdown below the top bar */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
            <a
              href="#features"
              className="block text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-gray-800 rounded-xl px-4 py-4 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-gray-800 rounded-xl px-4 py-4 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it Works
            </a>
            <a
              href="#about"
              className="block text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-gray-800 rounded-xl px-4 py-4 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#symptom-checker"
              className="block text-lg font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-800 rounded-xl px-4 py-4 transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              🩺 Try AI Symptom Checker
            </a>
            <div className="pt-2 pb-2">
              <button
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all text-lg font-semibold shadow-lg"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
