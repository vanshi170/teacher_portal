# 🎓 Student Attendance & Academic Portal

> **Symbiosis Institute of Technology (SIT), Nagpur**  
> Complete student portal companion app featuring real-time attendance tracking, exam eligibility dashboard, interactive attendance calculator, timetable scheduler, and QR scanner.

---

## ✨ Features & Modules

### 🔐 1. Authentication & Student Identity
- **Student Sign In**: Log in using PRN / Roll Number and Password with persistent JWT authentication.
- **New Student Registration**: Register with Full Name, PRN, Email, Password, Department, Section (A–E), and Semester (1–8).
- **One-Click Demo Accounts**: Instant test login presets for class roster students (Arushi Varghese, Laranya Shende, Aditya Raj, Harshini S J) with different attendance profiles to test eligibility warnings.
- **Backend Auto-Discovery**: Automatically connects to the live backend server on port 10000; provides seamless local demo mode when running offline.

### 📊 2. Student Dashboard
- **Welcome Hero Card**: Student identity, department, section, semester, and live date/time.
- **University 75% Exam Eligibility Monitor**: Real-time status badge detecting whether the student meets the mandatory 75% attendance cutoff, with classes-needed or safe-bunk indicators.
- **Top Metrics Grid**: Visual SVG radial gauge for overall attendance percentage, attended classes, missed sessions, and safe bunk margin.
- **Subject-Wise Breakdown**: Detailed course-level metrics (classes attended, absent, late, percentage progress bar, safety badge: Safe/At Risk/Critical, and direct 1-click calculator jump).
- **Recent Attendance Feed**: Activity log of recent lectures and statuses (`Present`, `Late`, `Absent`).

### 🧮 3. Smart Attendance Calculator
- **Target Selection**: Quickly toggle between 75% (university mandatory threshold), 80%, 85%, or custom percentage targets.
- **Scope Options**: Run calculations on overall attendance, individual course subjects, or enter custom what-if numbers.
- **Bunk / Margin Predictor**:
  - If above target: Calculates exactly how many classes you can safely skip/bunk without dropping below your goal.
  - If below target: Calculates the exact number of consecutive classes you must attend to restore eligibility.
- **Interactive "What-If" Simulator**: Dual sliders ("If I attend next X classes" / "If I skip next Y classes") providing live dynamic percentage shift previews.
- **Subject-by-Subject Planning Matrix**: Complete table across all courses showing current status, classes needed, and safe bunks.

### 📅 4. Class Timetable
- **Day-by-Day Selector**: Interactive tabs for Monday through Saturday, plus auto-selected "Today" filter.
- **Live Now / Up Next Banner**: Real-time lecture detection highlighting current or upcoming class with room number, faculty, and time slot.
- **Timeline View**: Cards detailing lecture start/end times, course codes, lecture halls/labs, faculty names, and type (`Lecture`, `Lab`, `Tutorial`).
- **One-Click Attendance Shortcut**: Jump directly into QR check-in from the active class card.
- **Full Week Grid**: Matrix view of the entire weekly timetable schedule.

### 📷 5. QR Attendance Scanner
- **Campus GPS Geofencing**: Geolocation check with developer test bypass toggle.
- **College Wi-Fi Verification**: Validates connection to `SYMBI_NGP_STUDENT`.
- **Biometric Face Verification**: Mirrored circular camera preview with radar pulse verification.
- **Camera & File QR Scanner**: Live camera scanning (`html5-qrcode`) with camera flip and photo upload fallback.
- **Instant Backend Sync**: Submits authenticated scan with JWT bearer token to `POST /api/attendance/scan` with success chime, confetti, and instant dashboard sync.


---

## 🎨 Theme & Design System

Harmonized with the Teacher Attendance Portal's glassmorphic aesthetic:
- **Canvas Background:** `#fdf2f6` (Soft pastel pink)
- **Primary Accent:** `#EC77AB` (Hot pink)
- **Secondary Border:** `#D4C0F2` (Thistle lavender)
- **Text:** `#12122B` (Deep ink) & `#6B6B85` (Muted)
- **Status Badges:** `#16A34A` (Present / Green) & `#DC2626` (Error / Red)
- **Typography:** **Sora** (Headings), **IBM Plex Mono** (PRNs & Badges), **Inter** (Body)

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Verify `.env` has the backend URL:
```env
VITE_API_URL=http://localhost:10000
```

### 3. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

*(Or double-click `run-scanner.bat` on Windows)*

---

## 🧪 Pre-Seeded Students for Testing

| Section | Student PRN (Roll No) | Student Name |
| :--- | :--- | :--- |
| **Section A** | `25070521001` | ARUSHI VARGHESE |
| **Section A** | `25070521002` | LARANYA SHENDE |
| **Section A** | `25070521004` | HARSHINI S J |
| **Section B** | `25070521071` | PREETI GAUTAM |
| **Section C** | `25070521142` | ADITYA RAJ |

---

## 📦 Production Build

```bash
npm run build
```
Builds cleanly with **0 TypeScript and Vite bundle errors**.
