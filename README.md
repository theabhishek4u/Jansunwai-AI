# Jansunwai AI (जनसुनवाई)
### AI-Powered Constituency Development Planning Platform
> *Helping Members of Parliament (MPs) make data-driven, transparent, and prompt development decisions.*

---

## 📌 Project Overview
**Jansunwai AI** transforms traditional public grievance filing into a collaborative, data-driven **Constituency Decision Intelligence Platform**. 

Instead of routing citizen requests through standard static complaint lines, Jansunwai aggregates citizen developmental suggestions, applies **Artificial Intelligence** (Gemini 2.5 Flash) to filter duplicates and verify submissions with geo-coordinates/photos, overlays grounded infrastructure/census datasets, and assists MPs in prioritizing budgets and simulating developmental impacts.

---

## 🚀 Key Features

### 1. Citizen Engagement Portal (`/dashboard`)
* **Voice-Assisted Submissions**: Citizen suggestion reporting with built-in voice audio recordings and AI speech-to-text transcription.
* **AI Writing Co-author**: Instant writing assist to expand short descriptions into formal project statements.
* **Vision Validation**: Automatic image auditing to verify if attached photos correspond to report categories (e.g. validating road potholes or broken pipes).
* **Project Timelines**: Real-time suggestion lifecycle tracking (AI Audit, Review, Scheduled, Active, Completed).
* **Gamification Engine**: Badges and social contributor rankings based on submission completeness and verification.

### 2. MP Decision Intelligence Portal (`/mp`)
* **KPI Command Gauge**: Comprehensive Circular health indicators displaying priority categories, registered users, and budget utilization dials.
* **AI Priority Engine**: Multi-factor scoring index based on population affected, cost estimates, urgency, and infrastructure gaps.
* **Budget Allocation Planner**: Drag-and-drop Recharts-powered budget sliders allowing MPs to tune funding values with immediate category-wide adjustments.
* **Scenario Impact Simulator**: Dynamic sliders simulating changes to Health, Education, or Connectivity scores if suggested projects are executed.
* **PDF Governance Reporter**: Clean summaries generator for parliamentary sessions.

### 3. Super Admin National Command Center (`/admin`)
* **Executive India Operations Map**: Dynamic vector SVG India map presenting state performance levels and census indicators on hover.
* **Real-time Live Tick Ticker**: Live suggestions feed simulation showing platform operations stream from all parts of India.
* **System Diagnostic Dials**: Operational hardware statuses (CPU, RAM, API latencies).
* **Prompt configuration Suite**: Live codearea editor allowing Super Admins to dynamically update Gemini System instructions (e.g., MP Copilot prompt) instantly.
* **Public Datasets Ingestion**: Drag-and-drop file indexer with simulated chunking and semantic grounding progress bars.
* **Targeted Announcements & Security Audit Console**: Admin broadcast notifications and terminal-style audit trails panel.

---

## 🛠️ Technology Stack

### Frontend (Client)
* **Framework**: Next.js 15 (App Router, React 19)
* **Styling**: Tailwind CSS v4 & Vanilla CSS
* **Animations**: Framer Motion (smooth micro-interactions)
* **Visualization**: Recharts (Pie Chart, Bar Chart, Line Chart) & Vector SVG Mapping

### Backend (Server)
* **Runtime**: Node.js & Express (TypeScript, tsx watcher)
* **AI Engine**: Google GenAI SDK (Gemini 2.5 Flash)
* **File Processing**: Multer (in-memory buffer parsing)
* **Middlewares**: Custom Async Router wrapper (`asyncHandler`) and centralized API controller error catch (`errorHandler`)
* **Database**: Postgres / Supabase Client (fully integrated with an automated in-memory SQLite mockup db fallback when credentials are absent)

---

## ⚙️ Getting Started & Run Guidelines

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your system.

### 2. Clone and Install Dependencies
Install all package dependencies in the workspace root:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```
> *Note: If no `.env` credentials are set, the platform will automatically boot into **Simulation Mode**, pre-populating mock databases, active suggestions, and simulating AI completions locally.*

### 4. Running the Dev Stack
Launch both the Express backend and the Next.js client concurrently from the root directory:
```bash
npm run dev
```
* **Frontend Portal**: [http://localhost:3000](http://localhost:3000)
* **Backend API server**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Quick-Access Credentials
For testing and validation, the `/auth` portal provides **Quick Login Presets**:

| Portal | Email | Preset Password | Target Redirect |
| :--- | :--- | :--- | :--- |
| **Citizen Portal** | `aarav@mail.com` | `password` | `/dashboard` |
| **MP Dashboard** | `mp@jansunwai.gov.in` | `password` | `/mp` |
| **Super Admin** | `admin@jansunwai.gov.in` | `password` | `/admin` |

---

## 📂 Codebase Directory Outline

```
Jansunwai/
├── client/                 # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/           # Pages & Routes Grouping
│   │   │   ├── admin/     # Super Admin pages
│   │   │   ├── dashboard/ # Citizen engagement workspace
│   │   │   ├── mp/        # MP Decision Intelligence
│   │   │   └── auth/      # Dynamic role-based login
│   │   └── lib/           # Session Context & Hook Providers
│   └── package.json
│
├── server/                 # Express REST API Backend
│   ├── src/
│   │   ├── controllers/   # Gemini, MP planner & Admin APIs
│   │   ├── routes/        # Router endpoints
│   │   ├── middlewares/   # asyncHandler & errorHandler
│   │   ├── utils/         # Structured AppError class definitions
│   │   └── db/            # Schema scripts & Mock databases
│   └── package.json
```

---

## 🛡️ License
Distributed under the **MIT License**. See `LICENSE` for more information.
