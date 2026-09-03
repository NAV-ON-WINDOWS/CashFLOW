# CashFLOW — Wealth & Mutual Fund Analytics Terminal

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-red?style=flat-square)](https://www.sqlalchemy.org/)
[![AMFI API](https://img.shields.io/badge/Data-AMFI%20India-blue?style=flat-square)](https://www.amfiindia.com/)

**CashFLOW** is a self-hosted personal mutual fund terminal and portfolio monitoring platform. It bridges the gap between static Consolidated Account Statements (CAS) and live financial tracking by ingesting raw daily NAV data directly from the **Association of Mutual Funds in India (AMFI)**. 

Built with a **FastAPI** backend and a **Next.js 14 (App Router)** frontend, CashFLOW provides continuous valuation of active investments, dynamically monitors the liquidation value of dormant holdings, and visualizes asset allocation across multiple portfolios.

---

## Key Features

### 1. Master Portfolio Intelligence
* **Consolidated Net Worth Engine:** Blends active capital contributions and dormant folios into unified telemetry: Total Capital Allocated, Combined Live Net Worth, Absolute Unrealized P&L, and Aggregated Cumulative ROI.
* **Dual-Column Portfolio Split:** Side-by-side management view comparing active SIP/lump-sum folios directly against parked, locked, or dormant holdings.
* **Master Asset Allocation Donut:** Interactive Recharts visualization mapping total portfolio weight across all schemes with automatic color bucketing and portfolio-share percentages.
* **Animated Value Transitions:** Integrated `AnimatedCounter` component using `requestAnimationFrame` with cubic-bezier smoothing for number roll-ins across tabs.

### 2. Active Portfolio Monitoring
* **Automated Daily Syncing:** Background cron worker (via `APScheduler`) pulls fresh market NAVs from AMFI every evening post-market close.
* **Real-Time P&L & Absolute Returns:** Dynamic calculation of gains based on exact unit balances, fractional units, and weighted average buy prices.
* **Interactive 1-Year NAV Charts:** Click any fund row to open an interactive modal plotting 365 days of historical NAV closing prices.
* **Transaction Engine:** Add, update, and remove active funds with automatic weighted average cost basis recalculation when averaging up or down.

### 3. Dormant (Inactive) Portfolio Tracking
* **Dynamic Value Tracking:** Tracks older, parked, or closed folios against live AMFI market rates to show actual liquidation value if redeemed today.
* **Historical NAV Inspection:** Full modal chart support for historical NAV trends on dormant AMFI-registered assets.
* **Isolated Bookkeeping:** Maintains dedicated records of units held, historical purchase price, exit price, and realized profit without distorting active performance metrics.

### 4. Watchlist & Discovery
* **Multi-Horizon Performance Metrics:** Evaluates potential funds with calculated trailing returns over 1-Month, 6-Month, 1-Year, and All-Time horizons.
* **Instant Scheme Onboarding:** Track any mutual fund across India by supplying its standardized 6-digit AMFI Scheme Code.

### 5. Multi-Format CAS Statement Export
* **Excel Workbook (.xlsx):** Generates structured spreadsheets complete with metadata headers, folio details, units, invested capital, live NAV, and returns.
* **Raw CSV (.csv):** Clean comma-separated exports ready for financial modeling in Python or R.
* **Print-Ready PDF Document:** CSS `@media print` styling removes UI controls, navigation tabs, and modals to print an institutional-grade PDF summary statement.

---

## System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 Frontend                      │
│     (App Router, Tailwind CSS, Recharts, Lucide Icons)      │
└──────────────┬───────────────────────────────▲──────────────┘
               │ HTTP Requests                 │ JSON Data
               │ (Axios Client)                │
┌──────────────▼───────────────────────────────┴──────────────┐
│                     FastAPI Backend                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Security Layer (CORS Whitelist, HSTS, CSP, Exception) │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │                               │
│  ┌───────────────────────┐  │  ┌─────────────────────────┐  │
│  │ SQLAlchemy 2.0 ORM    │  │  │ APScheduler Worker      │  │
│  │ (SQLite Engine)       │  │  │ (Nightly AMFI NAV Sync) │  │
│  └───────────┬───────────┘  │  └────────────┬────────────┘  │
└──────────────┼──────────────┴───────────────┼───────────────┘
               ▼                              ▼
      ┌─────────────────┐           ┌───────────────────┐
      │  portfolio.db   │           │  AMFI Open API    │
      │ (Local SQLite)  │           │  (amfiindia.com)  │
      └─────────────────┘           └───────────────────┘
```

---

## Security & Reliability Hardening

CashFLOW implements defensive engineering practices designed to keep private financial records secure:

| Vector | Status | Implementation Details |
| :--- | :---: | :--- |
| **CORS Lockdown** | Secured | Origins explicitly restricted to authorized frontend domains (`http://localhost:3000`). Wildcards are disabled. |
| **Defensive Headers** | Secured | Global HTTP middleware injects `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`. |
| **Error Masking** | Secured | Centralized unhandled exception catcher returns generic JSON 500 error messages to clients while logging full traces server-side. |
| **Data Isolation** | Secured | Local `portfolio.db` is untracked from version control via `.gitignore` to prevent committing personal holdings to public repositories. |
| **SQL Injection** | Immune | 100% of read and write interactions use SQLAlchemy parameterized queries and ORM objects. |
| **XSS Prevention** | Immune | React virtual DOM auto-escapes all user-supplied data bindings natively. |

---

## Database Schema (SQLAlchemy Models)

CashFLOW organizes investment tracking into three relational tables:

```python
# 1. Active Portfolio Holdings
class Holding(Base):
    __tablename__ = "holdings"
    id            = Column(Integer, primary_key=True, index=True)
    scheme_code   = Column(String, unique=True, index=True) # AMFI Scheme Code
    scheme_name   = Column(String, nullable=False)
    units         = Column(Float, nullable=False)
    avg_buy_price = Column(Float, nullable=False)
    folio_number  = Column(String, default="FOLIO-DEFAULT")
    purchase_date = Column(String, nullable=True)

# 2. Dormant / Liquidated Holdings
class InactiveHolding(Base):
    __tablename__ = "inactive_holdings"
    id              = Column(Integer, primary_key=True, index=True)
    scheme_code     = Column(String, nullable=True)
    scheme_name     = Column(String, nullable=False)
    units           = Column(Float, nullable=False)
    avg_buy_price   = Column(Float, nullable=False)
    sell_price      = Column(Float, default=0.0)
    realized_profit = Column(Float, default=0.0)
    folio_number    = Column(String, default="FOLIO-DEFAULT")
    purchase_date   = Column(String, nullable=True)
    sell_date       = Column(String, nullable=True)

# 3. Tracked Schemes Watchlist
class WatchlistItem(Base):
    __tablename__ = "watchlist_items"
    id          = Column(Integer, primary_key=True, index=True)
    scheme_code = Column(String, unique=True, index=True)
```

---

## Repository Structure

```text
cashflow/
├── backend/
│   ├── app/
│   │   ├── database.py              # SQLite engine and session factory
│   │   ├── main.py                  # API endpoints, CORS, security headers & error interceptor
│   │   ├── models.py                # SQLAlchemy schemas (Holding, InactiveHolding, WatchlistItem)
│   │   └── services/
│   │       ├── amfi_fetcher.py      # AMFI live NAV ingestion and parser
│   │       ├── historical_tracker.py# 1-month, 6-month, 1-year performance analytics
│   │       └── scheduler.py         # Nightly background cron NAV synchronization
│   ├── requirements.txt             # Pinned backend dependencies
│   └── portfolio.db                 # Local SQLite instance (git-ignored)
│
├── frontend/
│   ├── app/
│   │   ├── globals.css              # Styling rules and print layout configuration
│   │   ├── layout.tsx               # Root HTML shell and metadata title definitions
│   │   └── page.tsx                 # Master Overview, Active, Dormant & Watchlist views
│   ├── components/
│   │   ├── AddInactiveModal.tsx     # Dormant fund entry modal
│   │   ├── AddTransactionModal.tsx  # Active fund buy modal
│   │   ├── AddWatchlistModal.tsx    # Scheme discovery tracking modal
│   │   ├── AllocationChart.tsx      # Doughnut asset allocation chart
│   │   ├── AnimatedCounter.tsx      # Fluid numeric roll-in component
│   │   ├── EditFundModal.tsx        # Active fund details editor
│   │   ├── EditInactiveModal.tsx    # Dormant record editor
│   │   └── NavChartModal.tsx        # 1-year historical NAV chart viewer
│   ├── lib/
│   │   ├── api.ts                   # Axios configuration and type definitions
│   │   └── exportUtils.ts           # Excel (.xlsx) and CSV generators
│   └── package.json                 # Pinned frontend dependencies
│
├── .gitignore                       # Prevents committing local databases and cache
└── README.md                        # Documentation
```

---

## Getting Started: Complete Setup Guide

Follow these instructions to get both the backend API and frontend client up and running locally.

### Prerequisites
Make sure you have the following installed on your machine:
* **Python**: `3.10` or higher
* **Node.js**: `18.17` or higher
* **Package Managers**: `pip` and `npm` (or `pnpm`/`yarn`)
* **Git**: Installed and configured

---

### Step 1: Clone the Repository
Open your terminal and clone the project to your local machine:
```bash
git clone [https://github.com/](https://github.com/)<your-username>/cashflow.git
cd cashflow
```

---

### Step 2: Backend Setup (FastAPI)

The backend manages database interactions, calculates portfolio analytics, and communicates with AMFI servers.

1. **Open a terminal window and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create an isolated Python virtual environment:**
   * On Windows:
     ```bash
     python -m venv venv
     ```
   * On macOS / Linux:
     ```bash
     python3 -m venv venv
     ```

3. **Activate the virtual environment:**
   * On Windows (Command Prompt / PowerShell):
     ```bash
     venv\Scripts\activate
     ```
   * On macOS / Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install all required backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the FastAPI development server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   Once running, the backend services will be available at:
   * **API Base URL:** `http://localhost:8000`
   * **Interactive Swagger UI:** `http://localhost:8000/docs`
   * **ReDoc Documentation:** `http://localhost:8000/redoc`

*(Note: SQLite will automatically create `portfolio.db` on first run if it does not already exist).*

---

### Step 3: Frontend Setup (Next.js 14)

The frontend provides the interactive user interface, data visualizations, and reporting tools.

1. **Open a second terminal window and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Verify API connectivity configuration:**
   Open `frontend/lib/api.ts` and confirm the base URL matches your local backend address:
   ```typescript
   baseURL: 'http://localhost:8000/api'
   ```

3. **Install the required Node modules:**
   ```bash
   npm install
   ```

4. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```

5. **Access the web application:**
   Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## API Reference

### System & Health
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Confirms API operational status and scheduler state. |
| `POST`| `/api/portfolio/sync-now` | Triggers an immediate, on-demand synchronization against AMFI feeds. |

### Active Portfolio
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/portfolio` | Returns consolidated summary and holdings enriched with live NAV. |
| `POST`| `/api/portfolio/transaction` | Ingests a new transaction or averages up an existing scheme. |
| `PUT` | `/api/portfolio/fund/{code}` | Updates scheme name, unit volume, cost basis, or folio number. |
| `DELETE` | `/api/portfolio/fund/{code}` | Permanently removes an active holding from the database. |

### Dormant Portfolio
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/inactive-portfolio` | Returns dormant folios with live calculated liquidation valuations. |
| `POST`| `/api/inactive-portfolio` | Logs a parked, locked, or liquidated scheme. |
| `PUT` | `/api/inactive-portfolio/{id}`| Updates holding records, exit values, and redemption dates. |
| `DELETE` | `/api/inactive-portfolio/{id}`| Removes an inactive record from tracking. |

### Watchlist & Historical Charts
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tracker/watchlist` | Fetches tracked schemes with 1M, 6M, 1Y, and all-time returns. |
| `POST`| `/api/tracker/watchlist` | Adds a fund to the watchlist by its 6-digit AMFI code. |
| `GET` | `/api/tracker/fund/{code}` | Returns 365 daily closing NAV entries for historical charting. |

---

## Production Deployment & Multi-Tenancy Roadmap

To transition CashFLOW from a local personal terminal into a multi-tenant SaaS application, implement the following architectural milestones:

- [ ] **JWT Authentication:** Add user registration and login endpoints utilizing `bcrypt` hashing and signed Bearer tokens.
- [ ] **Row-Level Access Scoping:** Introduce an `owner_id` foreign key on the `holdings` and `inactive_holdings` tables to strictly isolate tenant data.
- [ ] **PostgreSQL Migration:** Move from SQLite to an enterprise relational engine (such as AWS RDS or Supabase) for transactional concurrency.
- [ ] **Redis Rate Limiting:** Implement token-bucket rate limiting on market synchronization endpoints to safeguard external AMFI API access.