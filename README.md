# MedTrax Frontend Dashboard

A premium, interactive, and responsive Frontend Dashboard for the MedTrax Hospital Management System. Built using modern web design principles, featuring a stunning glassmorphism dark-theme layout, responsive dashboards for Doctors and Patients, and real-time medical queueing/appointment booking visualizations.

## 🚀 Key Features

- **DNA Helix background:** Powered by React + Three.js + Canvas particle interactions.
- **Smart Appointment Scheduling:** Complete patient booking flow linked to doctor availabilities and scheduling queues.
- **Interactive Dashboards:** 
  - **Doctors:** View today's stats, upcoming appointments, manage pending appointment requests (Accept/Reject), and inspect patient reviews.
  - **Patients:** Dashboard statistics, medical history summaries, profile updates, and active prescription tracking.
- **Digital Prescriptions:** Comprehensive listing and detailed view of chief complaints, vitals, diagnoses, medications, and lab test instructions.
- **Community Forum:** Category filtering, article discussions, interactive likes, and comment threads.
- **Secure Authentication & Verification:** Cookie-based persistent JWT session verification, email OTP verification, password reset, and dynamic onboarding forms.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Custom design system built with CSS variables (Glassmorphism & Neon accents)
- **3D Graphics & Animations:** Three.js + Framer Motion
- **HTTP client:** Axios with integrated 401 token refresh interceptors
- **Icons:** Lucide React

---

## 💻 Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Agrim-Dubey/medtrax-frontend.git
   cd medtrax-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=https://medtrax-hms-6.onrender.com
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```
