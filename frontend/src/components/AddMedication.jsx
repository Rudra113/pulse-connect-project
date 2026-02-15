/**
 * AddMedication Component
 * Modal form for adding a new medication to track
 */

import React, { useState } from "react";

function AddMedication({ onAdd, onClose }) {
  // Form state
  const [formData, setFormData] = useState({
    medicineName: "",
    totalQuantity: 30,
    dailyDosage: 1,
    startDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    refillThreshold: 5,
  });

  // Error state for form validation
  const [errors, setErrors] = useState({});
  // Loading state while submitting
  const [loading, setLoading] = useState(false);

  /**
   * Handle input changes
   * Updates the formData state when user types
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Convert to number for number inputs, otherwise use string value
      [name]: type === "number" ? Number(value) : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Validate the form before submission
   * Returns true if valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};

    // Medicine name is required
    if (!formData.medicineName.trim()) {
      newErrors.medicineName = "Medicine name is required";
    }

    // Total quantity must be positive
    if (formData.totalQuantity < 1) {
      newErrors.totalQuantity = "Quantity must be at least 1";
    }

    // Daily dosage must be positive
    if (formData.dailyDosage < 1) {
      newErrors.dailyDosage = "Daily dosage must be at least 1";
    }

    // Daily dosage shouldn't exceed total quantity
    if (formData.dailyDosage > formData.totalQuantity) {
      newErrors.dailyDosage = "Daily dosage cannot exceed total quantity";
    }

    // Start date is required
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    // Threshold must be positive
    if (formData.refillThreshold < 1) {
      newErrors.refillThreshold = "Threshold must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onAdd(formData);
    } catch (error) {
      console.error("Error adding medication:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Close modal when clicking outside
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Add New Medication
                </h2>
                <p className="text-indigo-100 text-sm">
                  Track your medication inventory
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Medicine Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Medicine Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="medicineName"
              value={formData.medicineName}
              onChange={handleChange}
              placeholder="e.g., Vitamin D3, Aspirin, Metformin"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all ${
                errors.medicineName
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {errors.medicineName && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.medicineName}
              </p>
            )}
          </div>

          {/* Total Quantity and Daily Dosage - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Quantity <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="totalQuantity"
                  value={formData.totalQuantity}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 pr-16 border-2 rounded-xl focus:ring-2 transition-all ${
                    errors.totalQuantity
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  pills
                </span>
              </div>
              {errors.totalQuantity && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.totalQuantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Daily Dosage <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="dailyDosage"
                  value={formData.dailyDosage}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 pr-16 border-2 rounded-xl focus:ring-2 transition-all ${
                    errors.dailyDosage
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  /day
                </span>
              </div>
              {errors.dailyDosage && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.dailyDosage}
                </p>
              )}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 transition-all ${
                errors.startDate
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
              }`}
            />
            {errors.startDate && (
              <p className="mt-2 text-sm text-red-600">{errors.startDate}</p>
            )}
            <p className="mt-2 text-sm text-gray-500 flex items-center">
              <svg
                className="w-4 h-4 mr-1 text-gray-400"
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
              When did you start taking this medication?
            </p>
          </div>

          {/* Refill Threshold */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Refill Alert Threshold
            </label>
            <div className="relative">
              <input
                type="number"
                name="refillThreshold"
                value={formData.refillThreshold}
                onChange={handleChange}
                min="1"
                className={`w-full px-4 py-3 pr-16 border-2 rounded-xl focus:ring-2 transition-all ${
                  errors.refillThreshold
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                pills
              </span>
            </div>
            {errors.refillThreshold && (
              <p className="mt-2 text-sm text-red-600">
                {errors.refillThreshold}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500 flex items-center">
              <svg
                className="w-4 h-4 mr-1 text-gray-400"
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
              Get an alert when remaining pills fall below this number
            </p>
          </div>

          {/* Preview Box */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
            <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Quick Preview
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-indigo-700">
                <span className="font-medium">{formData.totalQuantity}</span>{" "}
                pills at{" "}
                <span className="font-medium">{formData.dailyDosage}</span> pill
                {formData.dailyDosage > 1 ? "s" : ""}/day
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-100">
                <span className="text-2xl font-bold text-indigo-600">
                  {Math.floor(formData.totalQuantity / formData.dailyDosage)}
                </span>
                <span className="text-indigo-500 ml-1 text-sm">days</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Add Medication
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMedication;
