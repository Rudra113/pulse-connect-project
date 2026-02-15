/**
 * DashboardHeader Component
 * Header for dashboard pages
 */

import React from "react";
import { Heart, Bell, User, LogOut } from "lucide-react";

const DashboardHeader = ({ user, onLogout, portalLabel }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-teal-600" />
            <span className="text-2xl font-bold text-gray-900">Pulse.ai</span>
            {portalLabel && (
              <span className="hidden sm:inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                {portalLabel}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-teal-600 transition">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
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
              className="p-2 text-gray-600 hover:text-rose-600 transition"
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
