# 🏥 MedTracker - Medication Tracker & Refill Reminder System

A full-stack MERN (MongoDB, Express, React, Node.js) web application for tracking medication inventory and receiving refill reminders.

## 📋 Project Overview

This application helps users:
- Track their pill inventory (name, quantity, daily dosage)
- Visualize remaining stock with progress bars
- Receive automated refill reminders when stock is low
- Manage multiple medications in one dashboard

## 🏗️ Project Structure

```
MedicalTracker/
├── backend/                    # Node.js + Express API Server
│   ├── config/
│   │   └── db.js              # MongoDB connection configuration
│   ├── models/
│   │   ├── User.js            # User schema (for authentication)
│   │   └── Medication.js      # Medication schema with stock calculation
│   ├── routes/
│   │   └── medicationRoutes.js # API endpoints for medications
│   ├── jobs/
│   │   └── cronJob.js         # Nightly reminder scheduler
│   ├── server.js              # Express app entry point
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables
│
├── frontend/                   # React + Tailwind CSS UI
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx      # Main medication list view
│   │   │   ├── MedicationCard.jsx # Individual medication card
│   │   │   └── AddMedication.jsx  # Form to add new medication
│   │   ├── App.jsx            # Root React component
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Tailwind CSS + custom styles
│   ├── package.json           # Frontend dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   └── postcss.config.js      # PostCSS configuration
│
└── README.md                   # This file
```

## 🔧 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Tailwind CSS 3, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Scheduling** | node-cron |
| **Email** | Nodemailer (with Ethereal.email for testing) |

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Step 1: Clone/Download the Project
```bash
cd MedicalTracker
```

### Step 2: Set Up Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit the .env file with your MongoDB URI
```

**Important:** Update the `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/medication_tracker
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/medication_tracker
```

### Step 3: Set Up Frontend

```bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install
```

### Step 4: Start the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev    # Uses nodemon for auto-reload
# or
npm start      # Standard start
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```
Frontend runs on: `http://localhost:3000`

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/medications/:userId` | Get all medications for a user (with calculated stock) |
| `POST` | `/api/medications` | Add a new medication |
| `DELETE` | `/api/medications/:id` | Delete a medication |
| `PUT` | `/api/medications/:id/refill` | Refill a medication |
| `GET` | `/api/test-cron` | Manually trigger the cron job (for testing) |

### Sample API Request (Add Medication)
```json
POST /api/medications
{
  "userId": "65a1b2c3d4e5f6a7b8c9d0e1",
  "medicineName": "Vitamin D3",
  "totalQuantity": 30,
  "dailyDosage": 1,
  "startDate": "2026-02-01",
  "refillThreshold": 5
}
```

### Sample API Response (Get Medications)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "65b...",
      "medicineName": "Vitamin D3",
      "totalQuantity": 30,
      "dailyDosage": 1,
      "startDate": "2026-02-01",
      "remainingStock": 25,        // ← Calculated field
      "daysElapsed": 5,            // ← Calculated field
      "pillsConsumed": 5,          // ← Calculated field
      "daysRemaining": 25,         // ← Calculated field
      "needsRefill": false         // ← Calculated field
    }
  ]
}
```

## 📊 Core Logic: Stock Calculation

The remaining stock is calculated using this formula:

```
Remaining Stock = Total Quantity - (Daily Dosage × Days Elapsed)
```

This logic is implemented in [models/Medication.js](backend/models/Medication.js):

```javascript
medicationSchema.methods.calculateRemainingStock = function() {
    const today = new Date();
    const startDate = new Date(this.startDate);
    
    // Calculate days elapsed
    const timeDifference = today.getTime() - startDate.getTime();
    const daysElapsed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    
    // Calculate remaining stock
    const pillsConsumed = this.dailyDosage * daysElapsed;
    const remainingStock = Math.max(0, this.totalQuantity - pillsConsumed);
    
    return {
        daysElapsed,
        pillsConsumed,
        remainingStock,
        daysRemaining: Math.floor(remainingStock / this.dailyDosage)
    };
};
```

## ⏰ Cron Job: Nightly Refill Check

The cron job runs every night at midnight to check all medications and send email alerts for those needing refills.

**Cron Expression:** `0 0 * * *` (Every day at midnight)

```javascript
// From cronJob.js
cron.schedule('0 0 * * *', () => {
    checkMedicationsAndAlert();
}, {
    timezone: "America/New_York"
});
```

### Testing the Cron Job
1. Visit `http://localhost:5000/api/test-cron` to manually trigger
2. Check the terminal console for output
3. If Ethereal email is configured, you'll see a preview URL

## 📧 Email Configuration (Optional)

For testing emails, you can use [Ethereal.email](https://ethereal.email/create):

1. Go to https://ethereal.email/create
2. Create a test account
3. Update `.env` with the credentials:
```env
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_ethereal_username
EMAIL_PASS=your_ethereal_password
```

If no email credentials are configured, alerts are printed to the console.

## 🎨 Frontend Features

1. **Dashboard** - Grid view of all medications
2. **Medication Cards** - Visual progress bars showing stock levels
3. **Add Medication Modal** - Form with validation
4. **Refill Modal** - Quick refill functionality
5. **Summary Stats** - Total medications, refill alerts

### Progress Bar Colors
| Percentage | Color | Status |
|------------|-------|--------|
| > 50% | 🟢 Green | Good |
| 31-50% | 🟡 Yellow | Caution |
| 16-30% | 🟠 Orange | Warning |
| ≤ 15% | 🔴 Red | Critical |

## 📝 Key Files for Viva Explanation

### Backend
1. **[server.js](backend/server.js)** - Entry point, middleware setup, route configuration
2. **[models/Medication.js](backend/models/Medication.js)** - Schema definition + stock calculation method
3. **[routes/medicationRoutes.js](backend/routes/medicationRoutes.js)** - RESTful API endpoints
4. **[jobs/cronJob.js](backend/jobs/cronJob.js)** - Scheduled task + email sending

### Frontend
1. **[App.jsx](frontend/src/App.jsx)** - State management, API calls
2. **[Dashboard.jsx](frontend/src/components/Dashboard.jsx)** - Medication list display
3. **[MedicationCard.jsx](frontend/src/components/MedicationCard.jsx)** - Progress bar logic
4. **[AddMedication.jsx](frontend/src/components/AddMedication.jsx)** - Form handling

## 🧪 Demo Mode

The frontend includes demo data that loads automatically if the backend is not connected. This is useful for:
- Presenting the UI without database setup
- Testing frontend components independently

## 🚀 Future Enhancements (For Viva Discussion)

1. **User Authentication** - JWT-based login/signup
2. **Push Notifications** - Browser notifications for reminders
3. **Multiple Users** - Family medication tracking
4. **Medication History** - Track refill history
5. **Doctor Integration** - Share reports with healthcare providers
6. **Mobile App** - React Native version

## 👥 Team Members

- [Add your team member names here]

## 📄 License

This project is created for educational purposes as part of a college project.

---

## 🌐 Deployment Guide (Render.com)

### Prerequisites
1. Push your code to GitHub (without `.env` file!)
2. Create accounts on:
   - [Render.com](https://render.com) (free)
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (already have)

### Step 1: Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `medicaltracker-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Your MongoDB Atlas URI |
   | `JWT_SECRET` | Generate a secure random string |
   | `JWT_EXPIRE` | `7d` |
   | `FRONTEND_URL` | `https://your-frontend.onrender.com` |
   | `ALLOWED_ORIGINS` | `https://your-frontend.onrender.com` |
   | `EMAIL_SERVICE` | `gmail` |
   | `EMAIL_USER` | Your Gmail address |
   | `EMAIL_PASS` | Gmail App Password |
   | `GEMINI_API_KEY` | Your Gemini API key |

6. Click **"Create Web Service"**
7. Copy the deployed URL (e.g., `https://medicaltracker-api.onrender.com`)

### Step 2: Deploy Frontend

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect the same repository
3. Configure:
   - **Name:** `medicaltracker-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://your-backend.onrender.com/api` |

5. Click **"Create Static Site"**

### Step 3: Update CORS & URLs

After both services are deployed, update:
1. Backend `ALLOWED_ORIGINS` with your frontend URL
2. Backend `FRONTEND_URL` with your frontend URL

### Alternative: One-Click Deploy with Blueprint

The project includes a `render.yaml` file. In Render:
1. Click **"New +"** → **"Blueprint"**
2. Connect your repo
3. Render auto-detects `render.yaml` and deploys both services

### Important Notes

- 🆓 Free tier has cold starts (first request may take 30s)
- 🔒 Never commit `.env` files to Git
- 📧 For Gmail, create an [App Password](https://support.google.com/accounts/answer/185833)
- 🔄 Enable "Auto-Deploy" for automatic updates on git push

---

**Built with ❤️ using the MERN Stack**
