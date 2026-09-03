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