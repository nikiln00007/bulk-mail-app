# BulkMail Pro 🚀

> **High-Performance MERN Stack Bulk Email Dispatcher & Management Platform**

BulkMail Pro is a full-featured, enterprise-grade bulk email web application built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), **Tailwind CSS**, and **Nodemailer**. It features a modern email-dashboard UI with a live message preview panel, real-time deliverability statistics, CSV recipient importing, and comprehensive audit logs.

---

## 🌟 Key Features

- **Modern SaaS Mailbox UI**: Dual-pane compose view with real-time live preview, resembling a modern email client.
- **Bulk Email Dispatcher**: Send personalized bulk messages to multiple recipients with comma, space, or newline separation.
- **CSV Contact Importer**: Upload `.csv` files to instantly extract and validate recipient email addresses.
- **Deliverability Tracker**: Automatic tracking of Successful deliveries, Partial deliveries, and Failures with detailed bounce/error reasons.
- **Campaign Analytics Dashboard**: Real-time metric cards for Total Emails Sent, Successful Deliveries, Failed Emails, Total Campaigns, and Today's Emails.
- **Email History & Audit Log**: Searchable and filterable history of previous dispatches with full recipient audit breakdown.
- **Admin Authentication**: JWT-based authentication with bcrypt hashed credentials and protected routes.
- **Configurable SMTP Engine**: Reusable Nodemailer transport configured via environment variables (Gmail, SendGrid, Mailgun, Amazon SES, or custom SMTP).

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** (Custom curated light theme)
- **React Router DOM** (v7)
- **Axios** (With automatic JWT authorization interceptor)
- **React Hot Toast** (Toast notifications for dispatches, auth, and errors)
- **Lucide React** (Modern iconography)

### Backend
- **Node.js** & **Express.js** (REST API)
- **MongoDB** with **Mongoose**
- **Nodemailer** (SMTP email sending pipeline)
- **JSON Web Tokens (JWT)** & **bcryptjs** (Admin authentication)
- **Multer** & **csv-parser** (CSV recipient processing)
- **Validator** & **cors** & **dotenv**

---

## 📁 Project Structure

```text
bulk mail app nikil/
├── client/                     # Frontend React (Vite) application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Responsive navigation sidebar
│   │   │   ├── Navbar.jsx        # Top navigation with user controls
│   │   │   ├── StatCard.jsx      # Reusable dashboard metric cards
│   │   │   ├── EmailPreview.jsx  # Live email reader preview pane
│   │   │   └── ProtectedRoute.jsx# Auth route guard
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Admin login with quick demo filler
│   │   │   ├── Dashboard.jsx     # Campaign analytics overview
│   │   │   ├── ComposeMail.jsx   # Dual-pane compose & preview page
│   │   │   ├── EmailHistory.jsx  # Audit log with search & filters
│   │   │   ├── MailDetails.jsx   # Single campaign detailed breakdown
│   │   │   └── Settings.jsx      # SMTP configuration & setup guide
│   │   ├── services/
│   │   │   └── api.js            # Axios client with interceptors
│   │   ├── App.jsx               # Main routing & layout
│   │   ├── main.jsx              # App entry point
│   │   └── index.css             # Tailwind base & utilities
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend Node.js / Express API
│   ├── config/
│   │   ├── db.js                 # MongoDB Mongoose connection
│   │   └── mailer.js             # Reusable Nodemailer transporter
│   ├── controllers/
│   │   ├── authController.js     # Admin login, register, and profile
│   │   └── mailController.js     # Bulk mail sending, history, stats
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT protection middleware
│   ├── models/
│   │   ├── Admin.js              # Admin user schema
│   │   └── Mail.js               # Mail record schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   └── mailRoutes.js         # /api/mail endpoints
│   ├── utils/
│   │   └── validateEmails.js     # Email parsing and deduplication
│   ├── server.js                 # Express server entry point
│   ├── .env                      # Environment variables
│   ├── .env.example              # Sample environment template
│   └── package.json
│
├── sample_recipients.csv       # Ready-to-use CSV sample for testing
└── README.md                   # Documentation
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/bulkmailpro`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string.

---

### 2. Backend Setup

```bash
cd server
npm install
```

Configure your environment variables in `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bulkmailpro
JWT_SECRET=your_jwt_secret_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=BulkMail Pro <your_email@gmail.com>
```

Start the backend server:

```bash
# Production / standard start
npm start

# Or with live reload
npm run dev
```

The server will run on: **`http://localhost:5000`**

> **Default Demo Admin Credentials:**
> - Email: `admin@bulkmailpro.com`
> - Password: `admin123`
> *(The server automatically seeds this admin on first run).*

---

### 3. Frontend Setup

In a new terminal window:

```bash
cd client
npm install
npm run dev
```

The frontend will run on: **`http://localhost:5173`**

---

## 🔑 How to Setup Gmail SMTP (App Password)

If using Gmail to dispatch real emails:

1. Go to your **Google Account** > **Security**.
2. Make sure **2-Step Verification** is turned ON.
3. In the search box at the top of your Google Account page, search for **"App passwords"**.
4. Create an App password (e.g., name it `BulkMail Pro`).
5. Google will generate a 16-character code (e.g., `abcd efgh ijkl mnop`).
6. Copy that code and paste it into `SMTP_PASS` in `server/.env` (without spaces).
7. Set `SMTP_USER` to your Gmail address.
8. Restart your server.

---

## 📡 API Endpoints Reference

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new admin account | Public |
| `POST` | `/api/auth/login` | Authenticate admin & receive JWT | Public |
| `GET` | `/api/auth/me` | Fetch currently logged-in admin profile | Private |

### Mail Routes (`/api/mail`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/mail/send` | Dispatch bulk email campaign to recipients | Private |
| `GET` | `/api/mail/history` | Retrieve campaign history (supports `?status=` & `?search=`) | Private |
| `GET` | `/api/mail/history/:id` | Get full details & recipient audit of a single campaign | Private |
| `GET` | `/api/mail/stats` | Retrieve aggregate metrics for Dashboard cards | Private |
| `DELETE` | `/api/mail/history/:id` | Delete a mail history record | Private |
| `POST` | `/api/mail/upload-csv` | Upload and extract emails from a CSV file | Private |

---

## 🧪 Testing the Application

1. Open `http://localhost:5173` in your browser.
2. Click **"Fill Default Admin Credentials"** and sign in.
3. On the **Dashboard**, check your real-time campaign counters.
4. Click **"Compose Bulk Mail"**:
   - Click **"Browse CSV"** and select `sample_recipients.csv` from the root folder, or paste custom emails.
   - Click **"Load Template"** to auto-fill a sample message.
   - Observe the live email preview update in real time on the right-hand panel.
   - Click **"Send Mail Now"**.
5. View the detailed audit breakdown in **Email History** or **Campaign Details**!
