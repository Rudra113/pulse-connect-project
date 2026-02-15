/**
 * Theme Context
 * Provides dark/light theme state and toggle functionality
 */

import React, { createContext, useState, useContext, useEffect } from "react";

// Create the Theme Context
const ThemeContext = createContext(null);

/**
 * Custom hook to use the theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

/**
 * Theme Provider Component
 * Wraps the app and provides theme state
 */
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("pulse_theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Fall back to system preference
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("pulse_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("pulse_theme", "light");
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem("pulse_theme");
      if (!savedTheme) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  /**
   * Toggle between light and dark mode
   */
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  /**
   * Set specific theme
   */
  const setTheme = (theme) => {
    setIsDarkMode(theme === "dark");
  };

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme,
    theme: isDarkMode ? "dark" : "light",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
