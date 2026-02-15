/**
 * DashboardHeader Component
 * Header for dashboard pages with dark mode toggle
 */

import React from "react";
import { Heart, Bell, User, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const DashboardHeader = ({ user, onLogout, portalLabel }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/30 sticky top-0 z-40 transition-colors duration-300 border-b border-gray-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Pulse.ai
            </span>
            {portalLabel && (
              <span className="hidden sm:inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium">
                {portalLabel}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
            <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role || "Patient"}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: user?.avatarColor || "#0D9488" }}
              >
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
