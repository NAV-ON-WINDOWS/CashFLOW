# myCAMS Portfolio Monitor

A full-stack mutual fund portfolio tracker built to monitor active investments and track historical NAV performance. It fetches live, official daily valuations directly from the Association of Mutual Funds in India (AMFI) and provides a clean, responsive dashboard for personal wealth management.

## 🚀 Features

* **Live AMFI Integration:** Automatically fetches the latest official end-of-day Net Asset Values (NAV) directly from the AMFI daily text feed.
* **Active Portfolio Tracking:** Dynamically calculates total invested capital, current net worth, and absolute/percentage returns based on user-entered holdings.
* **Full CRUD Management:** Easily add, edit (units/avg buy price), and delete active mutual fund holdings.
* **Watchlist Analytics:** Track inactive or prospective funds with automated 1-month, 6-month, 1-year, and all-time performance metrics.
* **Interactive Historical Charts:** Visualizes complete fund history using Recharts, properly sorted chronologically to prevent rendering artifacts.
* **Zero-Config Persistence:** Utilizes an embedded SQLite database (`portfolio.db`) via SQLAlchemy to ensure data survives server restarts without complex database hosting.
* **PDF Statement Export:** Native one-click export to generate a clean, print-optimized A4 Consolidated Account Statement (CAS).

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts, Axios
* **Backend:** FastAPI, Python, Uvicorn, SQLAlchemy
* **Database:** SQLite (Local file-based persistent storage)
* **External APIs:** AMFI India Daily NAV Feed

## 📦 Local Setup & Installation

### 1. Backend (FastAPI + SQLite)

Navigate to the backend directory, install the dependencies, and start the Uvicorn server. The SQLite database file will automatically generate on the first run.

```bash
cd backend
pip install fastapi uvicorn sqlalchemy pydantic requests
python -m uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`. You can view the interactive API documentation at `http://localhost:8000/docs`.

### 2. Frontend (Next.js)

Open a new terminal window, navigate to the frontend directory, install dependencies, and start the development server.

```bash
cd frontend
npm install
npm run dev
```
The web dashboard will be available at `http://localhost:3000`.

## 📂 Project Structure

```text
mycams-clone/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application and route definitions
│   │   ├── database.py             # SQLAlchemy engine and SQLite connection
│   │   ├── models.py               # Database schemas (Holdings & Watchlist)
│   │   └── services/
│   │       ├── amfi_fetcher.py     # Live NAV extraction from AMFI feed
│   │       └── historical_tracker.py # Historical performance calculations
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Main dashboard UI and metric cards
│   │   └── globals.css             # Tailwind imports and PDF print styles
│   ├── components/                 # Modals (Transaction, Watchlist, Edit, Chart)
│   └── lib/
│       └── api.ts                  # Axios instance and API typings
```

## 🛣️ Roadmap / Pending PRD Milestones

* **Asset Allocation Visuals:** Implement a Recharts Donut chart to break down the portfolio across specific schemes/categories.
* **Automated CRON Scheduler:** Integrate `APScheduler` in FastAPI to silently fetch and cache the 11:00 PM AMFI closing file daily without relying on active client requests.
* **Docker Deployment:** Package the frontend and backend into a unified `docker-compose.yml` for isolated production deployments.