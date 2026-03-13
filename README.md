# 🏥 PulseConnect - Comprehensive Healthcare Platform & Medication Tracker

**PulseConnect** is a modern, full-stack MERN (MongoDB, Express, React, Node.js) web application designed to bridge the gap between patients and healthcare providers. It provides a cohesive ecosystem for digital health tracking, AI-assisted symptom triage, and live consultation management.

---

## 🌍 The Problem It Solves

In the real world, healthcare systems and patients face several critical challenges:

1. **Poor Medication Adherence:** Patients frequently forget to take their daily medications or fail to request refills before running out, leading to compounding health issues.
2. **Delayed Symptom Triaging:** When patients feel unwell, they often struggle to know if their symptoms require emergency care, a standard doctor visit, or simple home rest.
3. **Inefficient Doctor Waiting Rooms:** Physical clinics suffer from poor queue management, forcing patients to wait hours for simple consultations.
4. **Scattered Medical History:** Prescriptions, chat histories, and previous symptom checks are rarely kept in one accessible, centralized location for both the doctor and patient.

## 💡 How PulseConnect Solves It (Use Cases)

- **The Chronically Ill Patient:** Instead of manually counting pills, the patient enters their new prescription into PulseConnect. The system automatically calculates their remaining stock daily and sends an automated email alert when they reach a critical threshold (e.g., 5 pills left), preventing gaps in their treatment.
- **The Paranoid Parent:** A parent whose child wakes up with confusing symptoms can use the **Gemini AI Symptom Checker**. By typing "high fever and stiff neck", the AI immediately flags it as an "Emergency" and advises immediate clinical consultation, rather than the parent waiting until morning.
- **The Telehealth Doctor:** A doctor logs into their dashboard to see a clean, organized **Live Patient Queue**. They can initiate a digital chat with the next patient in line, review their AI symptom report, prescribe medications digitally, and complete the consultation.

---

## ✨ Comprehensive Feature List

### 🧍 For Patients
- **Smart Medication Tracking:** Add prescriptions with total quantities and daily dosages. PulseConnect calculates remaining stock programmatically without manual daily deductions.
- **Automated Refill Reminders:** Nightly cron jobs evaluate stock levels and send automated email alerts before medications run out.
- **AI Symptom Analyzer (Powered by Google Gemini):** Input symptoms to receive instant probable diagnoses, severity/urgency levels, and recommendations.
- **Consultation Queueing:** Join a live digital queue to speak with specific doctors based on their specialization.
- **Secure Messaging:** Chat live with approved healthcare providers.
- **Digital Prescriptions:** Receive and store official digital prescriptions from doctors.

### 👨‍⚕️ For Doctors
- **Live Queue Management:** View and manage patients waiting for consultations in real-time.
- **Patient History Access:** Review a patient's self-reported AI symptom checks and past prescriptions.
- **Quick Prescribing:** Issue new prescriptions directly through the dashboard.
- **Secure Chat:** Communicate directly with patients in the queue.

### 🛡️ For Administrators
- **Doctor Verification:** Verify and approve newly registered doctor accounts to ensure platform integrity.
- **System Oversight:** Monitor all platform activities, statistics, and user management.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Tailwind CSS, Axios, React Router v7 |
| **Backend** | Node.js, Express.js, JSON Web Tokens (JWT) |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Artificial Intelligence** | Google Gemini API (gemini-2.5-flash-preview) |
| **Scheduling & Email** | node-cron, Nodemailer (Ethereal for testing) |
| **Security** | bcryptjs, express-rate-limit |

---

## 🚀 Local Setup & Installation Instructions

Follow these instructions to run PulseConnect entirely on your local machine for development or testing.

### Prerequisites
1. **Node.js**: Install version v18 or higher from [nodejs.org](https://nodejs.org).
2. **MongoDB**: Have a local MongoDB instance running, or create a free cloud database on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
3. **Google Gemini Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/).

### Step 1: Clone the Repository
```bash
git clone https://github.com/Rudra113/pulse-ai.git
cd pulse-ai
```

### Step 2: Set Up the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a file named `.env` inside the `backend` folder and add the following configuration:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pulseconnect
   PORT=5000
   NODE_ENV=development

   # Security
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   ALLOWED_ORIGINS=http://localhost:3000
   FRONTEND_URL=http://localhost:3000

   # Email Alerts (Use Ethereal.email for free testing credentials)
   EMAIL_HOST=smtp.ethereal.email
   EMAIL_PORT=587
   EMAIL_USER=your_ethereal_user
   EMAIL_PASS=your_ethereal_pass
   REFILL_THRESHOLD=5

   # Artificial Intelligence
   GEMINI_API_KEY=your_gemini_api_key

   # Initial Admin Credentials (Required for Step 3)
   ADMIN_EMAIL=admin@pulseconnect.com
   ADMIN_PASSWORD=secure_password123
   ADMIN_NAME=System Administrator
   ```

### Step 3: Seed the Admin Account (Crucial!)
To access the system fully, you must create the initial Admin account. In the `backend` terminal, run:
```bash
npm run seed:admin
```
*If successful, it will print "Admin user created successfully!". You will use this email and password to log in.*

### Step 4: Set Up the Frontend
1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Create a file named `.env` inside the `frontend` folder:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Step 5: Boot the Application
1. In your **Backend** terminal, start the server:
   ```bash
   npm run dev
   ```
   *(It will start on Port 5000 and log "Connected to MongoDB")*

2. In your **Frontend** terminal, start the React app:
   ```bash
   npm start
   ```
   *(It will open your browser to `http://localhost:3000`)*

**You can now log in using the Admin credentials you seeded in Step 3!**

---

## 🌐 Production Deployment (Render)

PulseConnect is configured with a `render.yaml` Blueprint for 1-click cloud deployment.

1. Ensure your MongoDB Atlas cluster has IP Access `0.0.0.0/0` (Allow from anywhere).
2. In the Render Dashboard, click **New +** -> **Blueprint**.
3. Connect your fork of this repository and supply the required environment variables.
4. **Post-Deployment:** Update `ALLOWED_ORIGINS` on the backend and `REACT_APP_API_URL` on the frontend with the live URLs that Render generates to satisfy CORS policies.

---
**Built with ❤️ using the MERN Stack**h services

### Important Notes

- 🆓 Free tier has cold starts (first request may take 30s)
- 🔒 Never commit `.env` files to Git
- 🔄 Enable "Auto-Deploy" for automatic updates on git push

---

**Built with ❤️ using the MERN Stack**
