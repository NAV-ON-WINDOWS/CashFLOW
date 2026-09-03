# CashFLOW — Wealth & Mutual Fund Analytics Terminal

A production-grade, full-stack mutual fund tracking and analytics dashboard engineered to mirror Consolidated Account Statement (CAS) data with real-time market valuations. Built with **Next.js 14**, **FastAPI**, **SQLAlchemy**, and live **AMFI** data feeds.

---

## Architecture Overview

* **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons.
* **Backend**: FastAPI, SQLAlchemy, SQLite, Pydantic, APScheduler.
* **Data Sources**: AMFI (Association of Mutual Funds in India) official open feeds.
* **Security Layer**: Global defensive HTTP middleware, restricted CORS origin policy, centralized unhandled exception masking.

---

## Key Features

### 1. Master Overview Dashboard
* **Consolidated Net Worth**: Aggregates Active and Dormant holdings into real-time portfolio metrics (Total Capital Allocated, Combined Live Net Worth, Total P&L, Cumulative ROI).
* **Dual Dashboard Layout**: Side-by-side management view separating active contributions from dormant/parked investments.
* **Rolling Numerical Transitions**: Integrated `AnimatedCounter` component applying cubic-ease roll-ins to financial metrics.
* **Master Asset Allocation**: Consolidated multi-slice doughnut visualization mapping market weight distribution across the entire portfolio.

### 2. Active Portfolio Monitoring
* **Automated Daily Syncing**: Powered by APScheduler, active scheme NAVs refresh every evening post-market directly against AMFI raw data.
* **Unrealized Gain/Loss Analysis**: Live calculation of absolute P&L and percentage returns based on exact unit balances and average purchase costs.
* **1-Year Performance Charts**: Click-to-inspect interactive area charts mapping historical NAV trends for individual schemes.

### 3. Dormant (Inactive) Portfolio Tracking
* **Dynamic Valuation**: Inactive/parked folios are actively tracked using live market rates rather than remaining static entries, tracking potential value if redeemed today.
* **Historical NAV Inspection**: Integrated modal support to view 1-year historical NAV trajectory for dormant AMFI-registered assets.
* **Isolated Bookkeeping**: Distinct database models to track redemption proceeds, exit dates, and historical buy metrics without distorting active performance.

### 4. Tracked Watchlist & Discovery
* **Benchmark Metrics**: Tracks schemes under consideration with 1-month, 6-month, 1-year, and all-time calculated performance returns.
* **AMFI Scheme Lookup**: Rapid tracking via standardized AMFI scheme codes.

### 5. Multi-Format CAS Export
* Direct client-side report generation supporting formatted **Excel workbooks (.xlsx)**, **raw data spreadsheets (.csv)**, and print-ready **PDF documents**.

---

## Security Hardening

The application conforms to automated security audit standards:

| Layer | Configuration | Implementation |
| :--- | :--- | :--- |
| **CORS Policy** | Explicit Allowlist | Restricted strictly to `http://localhost:3000` and trusted origins. Wildcard access (`*`) is disabled. |
| **Defensive Headers** | Global Middleware | Injects `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`. |
| **Error Handling** | Exception Interceptor | Server errors are caught centrally, logging technical details server-side while masking raw stack traces from client responses. |
| **Database Injection** | Parameterized ORM | All transactional interactions run through parameterized SQLAlchemy ORM queries. |

---

## Local Development Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000