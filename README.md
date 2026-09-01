# myCAMS Portfolio Monitor

A full-stack mutual fund portfolio tracker built to monitor active investments, visualize asset allocation, and track historical NAV performance. It fetches live, official daily valuations directly from the Association of Mutual Funds in India (AMFI) and provides a clean, responsive dashboard for personal wealth management.

## 🚀 Core Features

* **Live AMFI Integration:** Automatically fetches the latest official end-of-day Net Asset Values (NAV) directly from the AMFI daily text feed.
* **Automated Daily Sync:** An embedded `APScheduler` background job silently polls and caches the latest AMFI closing valuations every day at 11:05 PM IST.
* **Active Portfolio Tracking & CRUD:** Dynamically calculates total invested capital, current net worth, and returns. Easily add, edit, or delete active mutual fund holdings.
* **Watchlist Analytics:** Track inactive or prospective funds with automated 1-month, 6-month, 1-year, and all-time performance metrics.
* **Interactive Visualizations (Recharts):** * **NAV History:** Chronologically sorted area charts for historical performance.
  * **Asset Allocation:** Interactive donut chart displaying portfolio diversification and fund weight distributions.
* **Multi-Format Statement Exports:** Generate clean, print-optimized PDF Consolidated Account Statements (CAS), or export raw data to Excel Workbooks (`.xlsx`) and CSVs directly from the client side.
* **Zero-Config Persistence:** Utilizes an embedded SQLite database (`portfolio.db`) via SQLAlchemy to ensure data survives server restarts without complex database hosting.
* **Production-Ready Containerization:** Multi-stage Docker builds and a unified `docker-compose.yml` for isolated, zero-configuration deployments.

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts, SheetJS (xlsx), Axios
* **Backend:** FastAPI, Python, Uvicorn, SQLAlchemy, APScheduler
* **Database:** SQLite (Local file-based persistent storage)
* **Deployment:** Docker, Docker Compose

## 📦 Run Locally (Docker - Recommended)

The easiest way to spin up the entire application is using Docker. Ensure Docker Desktop is running on your machine.

```bash
# Clone the repository and navigate to the project root
git clone <your-repo-url>
cd mycams-clone

# Build and start the containers
docker compose up --build
```
* **Frontend Dashboard:** `http://localhost:3000`
* **Backend API & Swagger Docs:** `http://localhost:8000/docs`

## 💻 Run Locally (Native OS)

If you prefer to run the native processes without Docker, open two separate terminals:

### 1. Backend (FastAPI)
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

## 📂 Project Structure

```text
mycams-clone/
├── docker-compose.yml              # Multi-container orchestration
├── backend/
│   ├── Dockerfile                  # Python 3.11-slim backend image
│   ├── requirements.txt            # Python dependencies
│   ├── app/
│   │   ├── main.py                 # FastAPI application, endpoints, and lifecycle
│   │   ├── database.py             # SQLAlchemy engine and SQLite connection
│   │   ├── models.py               # Database schemas (Holdings & Watchlist)
│   │   └── services/
│   │       ├── amfi_fetcher.py     # Live NAV extraction from AMFI feed
│   │       ├── historical_tracker.py # Historical performance calculations
│   │       └── scheduler.py        # APScheduler CRON jobs (Daily AMFI sync)
├── frontend/
│   ├── Dockerfile                  # Node 20 multi-stage frontend image
│   ├── package.json
│   ├── app/
│   │   ├── page.tsx                # Main dashboard UI, metrics, and export logic
│   │   └── globals.css             # Tailwind imports and PDF print styles
│   ├── components/                 # Modals & Charts (AllocationChart, NavChart, etc.)
│   └── lib/
│       ├── api.ts                  # Axios instance and API typings
│       └── exportUtils.ts          # SheetJS Excel/CSV export logic
```

## 🛣️ Future Enhancements
* **User Authentication:** Add NextAuth/JWT to support multiple users with private portfolios.
* **CI/CD Pipeline:** Implement GitHub Actions to automate linting, testing, and Docker image builds on push.
* **XIRR Calculations:** Add extended internal rate of return metrics for SIP-based transaction histories.