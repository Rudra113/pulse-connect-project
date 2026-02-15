/**
 * Doctor Dashboard Component
 * Dashboard for doctor users
 */

import React, { useState, useEffect } from "react";
import {
  User,
  Video,
  FileText,
  Search,
  Send,
  Plus,
  MessageSquare,
} from "lucide-react";
import DashboardHeader from "../components/common/DashboardHeader";
import { queueAPI, chatsAPI } from "../services/api";

const DoctorDashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState("queue");
  const [patientQueue, setPatientQueue] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [stats, setStats] = useState({
    waiting: 0,
    inConsultation: 0,
    completed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  // Prescription form state
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
  });

  // Check if doctor is approved
  const isApproved = user?.isApproved && user?.status === "approved";

  useEffect(() => {
    if (isApproved) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isApproved]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [queueRes, chatsRes, statsRes] = await Promise.all([
        queueAPI.getQueue(),
        chatsAPI.getAll(),
        queueAPI.getStats(),
      ]);

      if (queueRes.success) setPatientQueue(queueRes.data);
      if (chatsRes.success) {
        setChats(chatsRes.data);
        if (chatsRes.data.length > 0) {
          setSelectedChat(chatsRes.data[0]);
        }
      }
      if (statsRes.success) setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await chatsAPI.getMessages(chatId);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    try {
      const response = await chatsAPI.sendMessage(
        selectedChat._id,
        messageInput,
      );
      if (response.success) {
        setMessages([...messages, response.data]);
        setMessageInput("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleStartConsultation = async (queueId) => {
    try {
      await queueAPI.startConsultation(queueId);
      fetchData();
    } catch (error) {
      console.error("Error starting consultation:", error);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
      case "critical":
        return "bg-rose-100 text-rose-600 border-rose-200";
      case "medium":
        return "bg-orange-100 text-orange-600 border-orange-200";
      case "low":
        return "bg-green-100 text-green-600 border-green-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const totalUnread = chats.reduce(
    (sum, chat) => sum + (chat.unreadCount || 0),
    0,
  );

  // Show pending approval message for unapproved doctors
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <DashboardHeader
          user={user}
          onLogout={onLogout}
          portalLabel="Doctor Portal"
        />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/30 p-8">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-yellow-600 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {user?.status === "pending"
                ? "Pending Approval"
                : user?.status === "rejected"
                  ? "Registration Rejected"
                  : "Account Suspended"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {user?.status === "pending"
                ? "Your doctor registration is being reviewed by our admin team. You will be notified once your account is approved."
                : user?.status === "rejected"
                  ? "Unfortunately, your registration was not approved. Please contact support for more information."
                  : "Your account has been suspended. Please contact support for assistance."}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-left">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Account Details:
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Name: {user?.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email: {user?.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Specialty: {user?.specialty || "Not specified"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status:{" "}
                <span className="capitalize font-medium">{user?.status}</span>
              </p>
            </div>
            <button
              onClick={onLogout}
              className="mt-6 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <DashboardHeader
        user={user}
        onLogout={onLogout}
        portalLabel="Doctor Portal"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md dark:shadow-gray-900/30">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Patients Today
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md dark:shadow-gray-900/30">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.waiting}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              In Queue
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md dark:shadow-gray-900/30">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {stats.completed}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Completed
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md dark:shadow-gray-900/30">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalUnread}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Unread Chats
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveView("queue")}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeView === "queue"
                ? "bg-teal-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Patient Queue
          </button>
          <button
            onClick={() => setActiveView("chat")}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeView === "chat"
                ? "bg-teal-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Messages
            {totalUnread > 0 && (
              <span className="ml-2 bg-rose-500 text-white text-xs px-2 py-1 rounded-full">
                {totalUnread}
              </span>
            )}
          </button>
        </div>

        {/* Patient Queue View */}
        {activeView === "queue" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/30 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Patient Queue
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Patients waiting for consultation
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading queue...
              </div>
            ) : patientQueue.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                <p>No patients in queue</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Urgency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Wait Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {patientQueue.map((patient) => (
                      <tr
                        key={patient._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor:
                                  patient.patientId?.avatarColor || "#0D9488",
                              }}
                            >
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {patient.patientId?.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {patient.patientId?.age
                                  ? `${patient.patientId.age} years old`
                                  : "Age not provided"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {patient.condition}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getUrgencyColor(patient.urgency)}`}
                          >
                            {patient.urgency}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {patient.waitTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleStartConsultation(patient._id)}
                            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
                          >
                            Start Consultation
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Chat View */}
        {activeView === "chat" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat List */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/30 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {chats.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No chats yet
                  </div>
                ) : (
                  chats.map((chat) => (
                    <button
                      key={chat._id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                        selectedChat?._id === chat._id
                          ? "bg-teal-50 dark:bg-teal-900/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {chat.participant?.name}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {chat.lastMessage?.text || "No messages yet"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {chat.lastMessage?.sentAt
                          ? new Date(
                              chat.lastMessage.sentAt,
                            ).toLocaleTimeString()
                          : ""}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Window + Prescription Pad */}
            <div className="lg:col-span-2 grid lg:grid-cols-3 gap-6">
              {/* Chat Window */}
              <div
                className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/30 flex flex-col"
                style={{ height: "600px" }}
              >
                {selectedChat ? (
                  <>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {selectedChat.participant?.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Active now
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition">
                          <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-800/50 transition">
                          <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.senderId?._id === user?._id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              msg.senderId?._id === user?._id
                                ? "bg-teal-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.senderId?._id === user?._id
                                  ? "text-teal-100"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="bg-teal-600 text-white p-2 rounded-xl hover:bg-teal-700 transition"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                      <p>Select a chat to start messaging</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Prescription Pad */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/30 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400" />
                  Quick Prescription
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Medication
                    </label>
                    <input
                      type="text"
                      placeholder="Drug name"
                      value={prescriptionForm.medication}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          medication: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 500mg"
                      value={prescriptionForm.dosage}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          dosage: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Frequency
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 2x daily"
                      value={prescriptionForm.frequency}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          frequency: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 7 days"
                      value={prescriptionForm.duration}
                      onChange={(e) =>
                        setPrescriptionForm({
                          ...prescriptionForm,
                          duration: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <button className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition text-sm font-medium flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-1" />
                    Add to Prescription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
