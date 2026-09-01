# 🔒 myCAMS Portfolio Monitor (Local-First & Privacy-Focused)

A self-hosted, privacy-centric mutual fund portfolio monitor and analytics dashboard. Built to run locally on your machine, ensuring **100% of your holdings, invested capital, and folio numbers remain completely private on your local storage** while automatically fetching official daily valuations directly from the Association of Mutual Funds in India (AMFI).

---

## ✨ Why Local-First?

* **Absolute Privacy:** Your financial net worth and portfolio allocation never get uploaded to third-party cloud databases or commercial tracking servers.
* **No Authentication Friction:** No sign-up walls, forgotten passwords, or expired session tokens. Open the dashboard and start tracking immediately.
* **Zero Cloud Latency:** Sub-millisecond read/write speeds powered by an embedded local SQLite engine.
* **Offline Resilient:** View past portfolio snapshots and historical analytics even when disconnected from the internet.

---

## 🚀 Core Features

* **Live AMFI Integration:** Automatically retrieves official end-of-day Net Asset Values (NAV) directly from the AMFI daily text feed.
* **Automated Background Sync:** Embedded `APScheduler` CRON job silently polls and updates latest closing valuations daily at 11:05 PM IST.
* **Active Portfolio Tracking & CRUD:** Manage mutual fund holdings with real-time calculations for invested capital, current net worth, and absolute/percentage returns.
* **Watchlist Analytics:** Track prospective or benchmark funds with automated 1-month, 6-month, 1-year, and all-time performance metrics.
* **Interactive Visualizations (Recharts):**
  * **NAV History:** Chronologically sorted area charts visualizing long-term fund performance without rendering glitches.
  * **Asset Allocation:** Interactive donut chart displaying portfolio diversification and fund weight distributions.
* **Multi-Format Statement Exports:** * Clean, print-optimized **PDF Consolidated Account Statements (CAS)**.
  * Native client-side exports for **Excel Workbooks (`.xlsx`)** and raw **CSVs**.
* **Zero-Config Local Persistence:** Utilizes an embedded SQLite database (`portfolio.db`) managed via SQLAlchemy.
* **Containerized Deployment:** Multi-stage Docker build and unified `docker-compose.yml` for isolated single-command startup.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts, SheetJS (`xlsx`), Axios
* **Backend:** FastAPI, Python, Uvicorn, SQLAlchemy, APScheduler
* **Database:** SQLite (Local file-based persistent storage)
* **Packaging:** Docker, Docker Compose

---

## 📦 Quick Start (Docker - Recommended)

Run the entire application in isolated local containers:

```bash
# Clone the repository
git clone https://github.com/NAV-ON-WINDOWS/mycams-clone
cd mycams-clone

# Build and start services
docker compose up --build
```

* **Frontend Dashboard:** `http://localhost:3000`
* **FastAPI Backend & Swagger API Docs:** `http://localhost:8000/docs`

---

## 💻 Local Development Setup (Native OS)

If you prefer running the processes natively without Docker:

### 1. Backend (FastAPI + SQLite)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```text
mycams-clone/
├── docker-compose.yml              # Local multi-container orchestration
├── backend/
│   ├── Dockerfile                  # Python 3.11-slim container spec
│   ├── requirements.txt            # Python dependencies
│   ├── app/
│   │   ├── main.py                 # FastAPI endpoints, CORS, & app lifespan
│   │   ├── database.py             # SQLAlchemy local SQLite connection
│   │   ├── models.py               # Database schemas (Holdings & Watchlist)
│   │   └── services/
│   │       ├── amfi_fetcher.py     # Live NAV extraction from AMFI feed
│   │       ├── historical_tracker.py # Historical returns calculations
│   │       └── scheduler.py        # Daily background AMFI sync worker
├── frontend/
│   ├── Dockerfile                  # Next.js multi-stage production build
│   ├── package.json
│   ├── app/
│   │   ├── page.tsx                # Main dashboard UI, metrics, and export logic
│   │   └── globals.css             # Tailwind styling & print/PDF rules
│   ├── components/                 # Modals & Charts (AllocationChart, NavChart, etc.)
│   └── lib/
│       ├── api.ts                  # Axios client configuration
│       └── exportUtils.ts          # SheetJS Excel/CSV client export handlers
```

---

## 🛣️ Roadmap
* **Extended SIP Analytics:** Add XIRR (Extended Internal Rate of Return) calculations for periodic SIP transactions.
* **Automated Data Backup:** Local JSON/SQLite export & import mechanism to easily transfer portfolio data across machines.