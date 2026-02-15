/**
 * Dashboard Component
 * Displays all medications as cards with progress bars
 */

import React from "react";
import MedicationCard from "./MedicationCard";

function Dashboard({
  medications,
  loading,
  onDelete,
  onRefill,
  onTakeDose,
  onAddClick,
}) {
  // Show loading skeleton while fetching data
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse"
            >
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded-full w-full mb-4"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-gray-100 rounded-xl"></div>
                <div className="h-16 bg-gray-100 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state if no medications
  if (medications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl scale-150"></div>
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-lg shadow-blue-500/30 mb-6">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No Medications Yet
        </h3>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Start tracking your medications by adding your first one. We'll help
          you keep track of your inventory and remind you when it's time to
          refill.
        </p>
        <button
          onClick={onAddClick}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Add Your First Medication</span>
        </button>
      </div>
    );
  }

  // Calculate summary statistics
  const totalMeds = medications.length;
  const needsRefill = medications.filter((med) => med.needsRefill).length;
  const wellStocked = totalMeds - needsRefill;

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Medications */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">
                Total Medications
              </p>
              <p className="text-3xl font-bold text-gray-900">{totalMeds}</p>
            </div>
          </div>
        </div>

        {/* Needs Refill */}
        <div
          className={`rounded-2xl shadow-sm p-6 border transition-all hover:shadow-md ${
            needsRefill > 0
              ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
              : "bg-white border-gray-100"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`p-4 rounded-xl shadow-lg ${
                needsRefill > 0
                  ? "bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/25"
                  : "bg-gradient-to-br from-emerald-500 to-green-500 shadow-green-500/25"
              }`}
            >
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Needs Refill</p>
              <p
                className={`text-3xl font-bold ${needsRefill > 0 ? "text-red-600" : "text-emerald-600"}`}
              >
                {needsRefill}
              </p>
            </div>
          </div>
        </div>

        {/* Well Stocked */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Well Stocked</p>
              <p className="text-3xl font-bold text-emerald-600">
                {wellStocked}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Medications</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage and track your medication inventory
          </p>
        </div>
        {needsRefill > 0 && (
          <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="font-medium">
              {needsRefill} refill{needsRefill > 1 ? "s" : ""} needed
            </span>
          </div>
        )}
      </div>

      {/* Medication Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medications.map((medication) => (
          <MedicationCard
            key={medication._id}
            medication={medication}
            onDelete={onDelete}
            onRefill={onRefill}
            onTakeDose={onTakeDose}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
