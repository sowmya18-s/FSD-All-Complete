# Digital Certificate Verification Portal

A complete, secure, full-stack **MERN (MongoDB Atlas, Express.js, React.js, Node.js)** college-level mini-project for managing, verifying, and auditing academic credentials and extracurricular certificates.

---

## 1. Project Overview

The **Digital Certificate Verification Portal** provides a centralized platform where:
- **Students** can register, log in, submit certificate records (Workshop, Internship, NPTEL, Seminar, Hackathon, Sports, Technical Competition, Other), track real-time verification statuses, view administrator remarks, edit pending submissions, and manage their portfolio.
- **Administrators** can review submitted certificates in a dedicated queue, mark them as **Verified** or **Rejected**, record official audit remarks, view all registered students, delete invalid records, and generate/export certificate audit reports to CSV or printable documents.
- **Evaluators / Public Users** can use the **Public Verification Tool** on the homepage to instantly look up any certificate by registration number and confirm its validity and issuing details.

All data is permanently stored in **MongoDB Atlas (Cloud Database)**.

---

## 2. Technology Stack

- **Frontend**:
  - React.js (Vite)
  - React Router DOM (v6)
  - Axios (HTTP client with JWT Bearer token interceptor)
  - Lucide React (Clean, modern iconography)
  - Custom Responsive CSS Design System (Inter typography, CSS variables, mobile-friendly tables)

- **Backend**:
  - Node.js & Express.js REST API
  - JSON Web Tokens (JWT) for secure authentication
  - bcrypt.js for password hashing (min 10 salt rounds)
  - CORS enabled for seamless client-server interaction
  - Dotenv configuration

- **Database**:
  - **MongoDB Atlas** (Cloud Database Cluster)
  - Mongoose ODM with schemas, validation, references, and compound indexes

---

## 3. MongoDB Collections & Schemas

### 1. `Users` Collection
- `userId`: Auto-generated identifier (`STU-XXXXXX` for students, `ADM-XXXXXX` for admins)
- `name`: Student or Admin full name
- `email`: Unique, lowercased, validated email address
- `password`: Hashed with bcrypt (never stored as plain text)
- `role`: Role enum: `'student'` | `'admin'` (default: `'student'`)
- `timestamps`: `createdAt`, `updatedAt`

### 2. `Certificates` Collection
- `certificateId`: Auto-generated unique tracking ID (`CERT-XXXXXX`)
- `studentId`: MongoDB ObjectId referencing `User`
- `certificateTitle`: Official title of the course/event
- `certificateType`: Enum: `['Workshop', 'Internship', 'NPTEL', 'Seminar', 'Hackathon', 'Sports', 'Technical Competition', 'Other']`
- `organization`: Issuing institution / company
- `issueDate`: Date the certificate was issued
- `certificateNumber`: Unique registration / serial number (indexed for fast search)
- `verificationStatus`: Enum: `['Pending', 'Verified', 'Rejected']` (default: `'Pending'`)
- `latestVerification`: MongoDB ObjectId referencing `Verification`
- `timestamps`: `createdAt`, `updatedAt`

### 3. `Verification` Collection (Audit Trail)
- `verificationId`: Auto-generated audit identifier (`VER-XXXXXX`)
- `certificateId`: MongoDB ObjectId referencing `Certificate`
- `verifiedBy`: MongoDB ObjectId referencing `User` (the reviewing admin)
- `verificationDate`: Timestamp of review
- `remarks`: Detailed review notes / feedback from administrator
- `timestamps`: `createdAt`, `updatedAt`

---

## 4. Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- A free **MongoDB Atlas** account ([https://www.mongodb.com/atlas](https://www.mongodb.com/atlas))

---

### Step 1: Configure MongoDB Atlas Cloud Database

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to **Network Access** and ensure your IP is whitelisted (for development/testing, click **Add IP Address** and choose **Allow Access From Anywhere (`0.0.0.0/0`)**).
3. Go to **Database Access** and verify you have a Database User created with read and write permissions (e.g. username and password).
4. Go to **Database** -> Click **Connect** on your cluster -> Select **Drivers** (Node.js).
5. Copy your connection string. It will look like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xyz.mongodb.net/certificate_verification_db?retryWrites=true&w=majority
   ```
6. Open `backend/.env` file and paste your connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xyz.mongodb.net/certificate_verification_db?retryWrites=true&w=majority
   JWT_SECRET=super_secret_jwt_key_here_12345
   PORT=5000
   CLIENT_URL=http://localhost:5173

   ADMIN_NAME=System Administrator
   ADMIN_EMAIL=admin@certverify.edu
   ADMIN_PASSWORD=Admin@123456
   ```

---

### Step 2: Seed the Default Administrator Account

Student registration is restricted so that it can never create administrative accounts. Run the secure admin seed script:

```bash
cd backend
npm run seed
```

This will connect to your MongoDB Atlas cluster and create the administrator account:
- **Email**: `admin@certverify.edu`
- **Password**: `Admin@123456`

*(You can customize these credentials in `backend/.env` beforehand if desired).*

---

### Step 3: Run the Application

You can run both backend and frontend servers in separate terminal tabs:

#### Terminal 1 (Backend API):
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:5000` and display:
```text
======================================================
 MongoDB Atlas Connected Successfully!
 Host: cluster0.xyz.mongodb.net
 Database: certificate_verification_db
 Server is running on port 5000
======================================================
```

#### Terminal 2 (Frontend React App):
```bash
cd frontend
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

---

## 5. User Roles and Workflows

### A. Student Module
1. Navigate to **Register** and sign up with Name, Email, and Password.
2. Log in to access the **Student Dashboard**:
   - Live MongoDB counts for Total, Verified, Pending, and Rejected certificates.
   - Quick list of recent submissions.
3. Click **Add Certificate** and fill in:
   - Certificate Title
   - Type (Workshop, Internship, NPTEL, Seminar, Hackathon, Sports, Technical Competition, Other)
   - Issuing Organization
   - Issue Date
   - Unique Certificate Number
4. View **My Certificates**:
   - Filter by status and type.
   - Search by keyword.
   - Edit pending submissions or delete certificate records.
5. Click **View** on any certificate to view its detailed credential card and administrator review history.

### B. Admin Module
1. Sign in with the seeded credentials (`admin@certverify.edu` / `Admin@123456`).
2. Access the **Admin Dashboard**:
   - Global statistics from MongoDB Atlas (Total Students, Total Certificates, Verified, Pending, Rejected).
3. Access **Verify Certificates Queue**:
   - Filter and search all student submissions.
   - Click **Audit** to open the verification modal.
   - Choose **Verified** or **Rejected**, enter audit remarks, and save.
   - The status is updated in MongoDB and a permanent entry is added to the `Verification` audit trail.
4. Access **Registered Students**:
   - View all registered student profiles with their certificate counts.
5. Access **Certificate Reports**:
   - Filter by date range, status, and type.
   - Export to CSV format.
   - Print clean formatted reports.

### C. Public Verification Lookup
- On the Home Page, any visitor or examiner can enter a certificate registration number (e.g. `NPTEL-2024-9981`) to verify its legitimacy and view the verification status, issuing body, issue date, and admin remarks.

---

## 6. Project File Structure

```text
C:\Users\lenovo\OneDrive\Desktop\FSD\
│
├── package.json                 # Root script runner
├── README.md                    # Project documentation
├── .gitignore                   # Ignored files (node_modules, .env)
│
├── backend/
│   ├── .env                     # MongoDB URI & secrets
│   ├── .env.example             # Environment template
│   ├── package.json             # Backend dependencies
│   ├── server.js                # Express server entry point
│   │
│   ├── config/
│   │   └── db.js                # Mongoose MongoDB Atlas connection
│   │
│   ├── models/
│   │   ├── User.js              # User schema (Student & Admin)
│   │   ├── Certificate.js       # Certificate schema with indexes
│   │   └── Verification.js      # Verification audit trail schema
│   │
│   ├── middleware/
│   │   └── auth.js              # JWT verification & role authorization
│   │
│   ├── controllers/
│   │   ├── authController.js    # Register, login, user info
│   │   ├── certificateController.js # Student certificate CRUD & public lookup
│   │   └── adminController.js   # Admin stats, verification, student list, reports
│   │
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth routes
│   │   ├── certificateRoutes.js # /api/certificates routes
│   │   └── adminRoutes.js       # /api/admin routes
│   │
│   └── seed/
│       └── seedAdmin.js         # Script to seed default admin
│
└── frontend/
    ├── package.json             # Frontend dependencies
    ├── vite.config.js           # Vite configuration with API proxy
    ├── index.html               # HTML entry point with Inter font
    │
    └── src/
        ├── main.jsx             # React DOM entry
        ├── App.jsx              # Routes & ProtectedRoute configuration
        ├── index.css            # Complete design system & stylesheets
        │
        ├── context/
        │   └── AuthContext.jsx  # Global auth state & token management
        │
        ├── services/
        │   └── api.js           # Axios instance with auth interceptor
        │
        ├── components/
        │   ├── Navbar.jsx       # Responsive navigation bar
        │   ├── Footer.jsx       # Application footer
        │   ├── ProtectedRoute.jsx # Role-based route guard
        │   ├── StatusBadge.jsx  # Pill badges for statuses
        │   ├── StatCard.jsx     # Reusable dashboard metric card
        │   └── Modal.jsx        # Popover dialog modal
        │
        └── pages/
            ├── HomePage.jsx               # Landing page & public lookup
            ├── LoginPage.jsx              # Student & Admin sign-in
            ├── RegisterPage.jsx           # Student registration
            ├── StudentDashboard.jsx       # Student dashboard & stats
            ├── AddCertificatePage.jsx     # Certificate submission form
            ├── MyCertificatesPage.jsx     # Certificate list & search
            ├── CertificateDetailsPage.jsx # Certificate view & audit trail
            ├── AdminDashboard.jsx         # Administrator dashboard & metrics
            ├── AdminVerifyPage.jsx        # Verification queue & audit modal
            ├── AdminStudentsPage.jsx      # Students directory
            ├── AdminReportsPage.jsx       # Report generator & CSV export
            └── NotFoundPage.jsx           # 404 handler
```
