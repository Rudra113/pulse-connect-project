/**
 * Admin Dashboard Component
 * Dashboard for admin users - manage doctors recommendations
 */

import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  LogOut,
  Search,
  RefreshCw,
} from "lucide-react";
import { adminAPI } from "../services/api";

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectModal, setRejectModal] = useState({
    open: false,
    doctorId: null,
    doctorName: "",
  });
  const [rejectReason, setRejectReason] = useState("");

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, allRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingDoctors(),
        adminAPI.getAllDoctors(),
      ]);
      setStats(statsRes.data);
      setPendingDoctors(pendingRes.data);
      setAllDoctors(allRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    setActionLoading(doctorId);
    try {
      await adminAPI.approveDoctor(doctorId);
      await fetchData();
    } catch (error) {
      console.error("Error approving doctor:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.doctorId) return;
    setActionLoading(rejectModal.doctorId);
    try {
      await adminAPI.rejectDoctor(rejectModal.doctorId, rejectReason);
      setRejectModal({ open: false, doctorId: null, doctorName: "" });
      setRejectReason("");
      await fetchData();
    } catch (error) {
      console.error("Error rejecting doctor:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDoctors = (
    activeTab === "pending" ? pendingDoctors : allDoctors
  ).filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.specialty &&
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      suspended: { color: "bg-gray-100 text-gray-800", icon: AlertCircle },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500">Manage doctors and users</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-red-600 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalPatients}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Approved Doctors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.approvedDoctors}
                  </p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-yellow-200 bg-yellow-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {stats.pendingDoctors}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Pending ({pendingDoctors.length})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === "all"
                    ? "bg-teal-100 text-teal-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All Doctors ({allDoctors.length})
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-gray-500 hover:text-teal-600 transition"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Doctors List */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {activeTab === "pending"
                  ? "No pending doctor registrations"
                  : "No doctors found"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                        style={{
                          backgroundColor: doctor.avatarColor || "#3B82F6",
                        }}
                      >
                        {doctor.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-gray-500">{doctor.email}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {doctor.specialty && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {doctor.specialty}
                            </span>
                          )}
                          {doctor.experience && (
                            <span className="text-xs text-gray-500">
                              {doctor.experience} years exp.
                            </span>
                          )}
                          {getStatusBadge(doctor.status)}
                        </div>
                        {doctor.qualifications && (
                          <p className="text-sm text-gray-600 mt-1">
                            {doctor.qualifications}
                          </p>
                        )}
                        {doctor.licenseNumber && (
                          <p className="text-sm text-gray-500 mt-1">
                            License: {doctor.licenseNumber}
                          </p>
                        )}
                        {doctor.rejectionReason &&
                          doctor.status === "rejected" && (
                            <p className="text-sm text-red-600 mt-1">
                              Reason: {doctor.rejectionReason}
                            </p>
                          )}
                        <p className="text-xs text-gray-400 mt-1">
                          Registered:{" "}
                          {new Date(doctor.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {doctor.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(doctor._id)}
                          disabled={actionLoading === doctor._id}
                          className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() =>
                            setRejectModal({
                              open: true,
                              doctorId: doctor._id,
                              doctorName: doctor.name,
                            })
                          }
                          disabled={actionLoading === doctor._id}
                          className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {doctor.status === "approved" && (
                      <button
                        onClick={() =>
                          setRejectModal({
                            open: true,
                            doctorId: doctor._id,
                            doctorName: doctor.name,
                          })
                        }
                        className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject {rejectModal.doctorName}?
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setRejectModal({
                    open: false,
                    doctorId: null,
                    doctorName: "",
                  });
                  setRejectReason("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
