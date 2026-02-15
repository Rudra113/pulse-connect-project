/**
 * MedicationCard Component
 * Displays a single medication with progress bar and actions
 */

import React, { useState } from "react";

function MedicationCard({ medication, onDelete, onRefill, onTakeDose }) {
  // State for showing refill modal
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [refillQuantity, setRefillQuantity] = useState(
    medication.totalQuantity,
  );

  // Calculate percentage of pills remaining
  const percentRemaining = Math.round(
    (medication.remainingStock / medication.totalQuantity) * 100,
  );

  // Determine progress bar color based on percentage
  const getProgressColor = () => {
    if (percentRemaining <= 15) return "from-red-500 to-red-600";
    if (percentRemaining <= 30) return "from-orange-400 to-orange-500";
    if (percentRemaining <= 50) return "from-yellow-400 to-yellow-500";
    return "from-emerald-400 to-emerald-500";
  };

  const getProgressBg = () => {
    if (percentRemaining <= 15) return "bg-red-100";
    if (percentRemaining <= 30) return "bg-orange-100";
    if (percentRemaining <= 50) return "bg-yellow-100";
    return "bg-emerald-100";
  };

  // Format the start date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if start date is in the future
  const isStartDateFuture = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(medication.startDate);
    startDate.setHours(0, 0, 0, 0);
    return startDate > today;
  };

  // Handle refill submission
  const handleRefill = () => {
    onRefill(medication._id, refillQuantity);
    setShowRefillModal(false);
  };

  return (
    <>
      <div
        className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden ${
          medication.needsRefill
            ? "border-red-200 bg-gradient-to-br from-red-50 to-orange-50"
            : "border-gray-100 hover:border-gray-200"
        }`}
      >
        {/* Refill Badge */}
        {medication.needsRefill && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-2 px-4 text-sm font-medium">
            <span className="inline-flex items-center">
              <svg
                className="w-4 h-4 mr-1.5 animate-pulse"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Refill Needed
            </span>
          </div>
        )}

        <div className="p-6">
          {/* Medication Name */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {medication.medicineName}
              </h3>
              <p className="text-sm text-gray-500 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {isStartDateFuture() ? (
                  <span className="text-indigo-600 font-medium">
                    Starts: {formatDate(medication.startDate)}
                  </span>
                ) : (
                  <>Started: {formatDate(medication.startDate)}</>
                )}
              </p>
            </div>
            {/* Delete Button */}
            <button
              onClick={() => onDelete(medication._id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Delete medication"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          {/* Pills Count Display */}
          <div className="flex items-baseline mb-3">
            <span
              className={`text-4xl font-bold ${medication.needsRefill ? "text-red-600" : "text-indigo-600"}`}
            >
              {medication.remainingStock}
            </span>
            <span className="text-gray-500 ml-2 text-lg">
              / {medication.totalQuantity} pills
            </span>
          </div>

          {/* Progress Bar */}
          <div
            className={`h-3 rounded-full ${getProgressBg()} mb-5 overflow-hidden`}
          >
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out`}
              style={{ width: `${percentRemaining}%` }}
            ></div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-5">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-100">
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                Daily Dose
              </span>
              <p className="font-bold text-gray-900 text-lg mt-0.5">
                {medication.dailyDosage}
                <span className="text-sm font-medium text-gray-500 ml-1">
                  pill{medication.dailyDosage > 1 ? "s" : ""}/day
                </span>
              </p>
            </div>
            <div
              className={`rounded-xl p-3 border ${
                medication.daysRemaining <= 3
                  ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-100"
                  : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-100"
              }`}
            >
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                Days Left
              </span>
              <p
                className={`font-bold text-lg mt-0.5 ${medication.daysRemaining <= 3 ? "text-red-600" : "text-gray-900"}`}
              >
                {medication.daysRemaining}
                <span
                  className={`text-sm font-medium ml-1 ${medication.daysRemaining <= 3 ? "text-red-500" : "text-gray-500"}`}
                >
                  days
                </span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-100">
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                Consumed
              </span>
              <p className="font-bold text-gray-900 text-lg mt-0.5">
                {medication.pillsConsumed}
                <span className="text-sm font-medium text-gray-500 ml-1">
                  pills
                </span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-100">
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                Days Elapsed
              </span>
              <p className="font-bold text-gray-900 text-lg mt-0.5">
                {medication.daysElapsed}
                <span className="text-sm font-medium text-gray-500 ml-1">
                  days
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Take Dose Button */}
            <button
              onClick={() => onTakeDose(medication._id, medication.dailyDosage)}
              disabled={isStartDateFuture() || medication.remainingStock <= 0}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                isStartDateFuture() || medication.remainingStock <= 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              }`}
              title={
                isStartDateFuture()
                  ? "Medication hasn't started yet"
                  : medication.remainingStock <= 0
                    ? "No pills remaining"
                    : `Take ${medication.dailyDosage} pill${medication.dailyDosage > 1 ? "s" : ""}`
              }
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Take Dose</span>
            </button>

            {/* Refill Button */}
            <button
              onClick={() => setShowRefillModal(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                medication.needsRefill
                  ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
              }`}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{medication.needsRefill ? "Refill" : "Refill"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Refill Modal */}
      {showRefillModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5">
              <h3 className="text-xl font-bold text-white flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refill {medication.medicineName}
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Quantity
                </label>
                <input
                  type="number"
                  value={refillQuantity}
                  onChange={(e) => setRefillQuantity(Number(e.target.value))}
                  className="w-full px-4 py-3 text-lg font-semibold text-center border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  min="1"
                />
                <p className="text-sm text-gray-500 mt-3 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1.5 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  This will reset the start date to today.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRefillModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefill}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Confirm Refill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MedicationCard;
