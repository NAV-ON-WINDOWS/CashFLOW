from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict

from app.services.amfi_fetcher import get_latest_nav
from app.services.historical_tracker import calculate_performance_metrics

app = FastAPI(title="myCAMS Portfolio Monitor API")

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "message": "myCAMS Portfolio Monitor API is running",
        "docs": "/docs"
    }

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory Active Holdings Data Store
SAMPLE_HOLDINGS = [
    {
        "scheme_code": "120503",
        "scheme_name": "Axis ELSS- Tax Saver Fund - Direct Plan - Growth Option",
        "units": 125.400,
        "avg_buy_price": 65.20,
        "folio_number": "FOLIO-1001",
        "purchase_date": "2024-01-15"
    },
    {
        "scheme_code": "118834",
        "scheme_name": "Mirae Asset Large & Midcap Fund - Direct Plan - Growth",
        "units": 210.000,
        "avg_buy_price": 102.50,
        "folio_number": "FOLIO-1002",
        "purchase_date": "2023-11-10"
    },
    {
        "scheme_code": "125354",
        "scheme_name": "Axis Small Cap Fund - Direct Plan - Growth Option",
        "units": 85.120,
        "avg_buy_price": 180.10,
        "folio_number": "FOLIO-1003",
        "purchase_date": "2024-03-01"
    }
]

# In-memory Watchlist Scheme Codes
INACTIVE_WATCHLIST = [
    "120716",  # UTI Nifty 50 Index Fund - Direct Growth
    "118989",  # HDFC Mid-Cap Opportunities Fund - Direct Growth
    "120503",  # Axis ELSS Tax Saver
]

# Request Schemas
class ActiveFundCreate(BaseModel):
    scheme_name: str
    scheme_code: Optional[str] = None
    units: float
    avg_buy_price: float
    folio_number: Optional[str] = "FOLIO-DEFAULT"
    purchase_date: Optional[str] = None

class WatchlistAdd(BaseModel):
    scheme_code: str


@app.get("/api/portfolio")
def get_portfolio():
    total_invested = 0.0
    total_current_value = 0.0
    enriched_holdings = []

    for item in SAMPLE_HOLDINGS:
        code = item["scheme_code"]
        units = item["units"]
        avg_price = item["avg_buy_price"]
        invested_amt = units * avg_price
        total_invested += invested_amt

        # Query live AMFI NAV
        nav_info = get_latest_nav(code) if not code.startswith("CUSTOM") else None
        
        current_nav = nav_info["nav"] if (nav_info and nav_info.get("nav", 0) > 0) else avg_price
        nav_date = nav_info["date"] if nav_info else (item.get("purchase_date") or "N/A")
        scheme_name = item.get("scheme_name") or (nav_info["scheme_name"] if nav_info else f"Scheme {code}")

        current_val = units * current_nav
        total_current_value += current_val

        pnl = current_val - invested_amt
        returns_pct = round((pnl / invested_amt) * 100, 2) if invested_amt > 0 else 0.0

        enriched_holdings.append({
            "scheme_code": code,
            "scheme_name": scheme_name,
            "units": units,
            "avg_buy_price": avg_price,
            "current_nav": current_nav,
            "current_value": round(current_val, 2),
            "profit_loss": round(pnl, 2),
            "returns_percentage": returns_pct,
            "nav_date": nav_date,
            "folio_number": item.get("folio_number", "N/A")
        })

    total_profit_loss = total_current_value - total_invested
    overall_return = round((total_profit_loss / total_invested) * 100, 2) if total_invested > 0 else 0.0

    return {
        "summary": {
            "total_invested": round(total_invested, 2),
            "total_current_value": round(total_current_value, 2),
            "total_profit_loss": round(total_profit_loss, 2),
            "overall_return_percentage": overall_return,
        },
        "holdings": enriched_holdings
    }


@app.post("/api/portfolio/transaction")
def add_active_fund(fund: ActiveFundCreate):
    code = fund.scheme_code.strip() if fund.scheme_code else f"CUSTOM_{len(SAMPLE_HOLDINGS) + 1}"

    existing = next((h for h in SAMPLE_HOLDINGS if h.get("scheme_code") == code), None)

    if existing:
        total_units = existing["units"] + fund.units
        total_cost = (existing["units"] * existing["avg_buy_price"]) + (fund.units * fund.avg_buy_price)
        existing["units"] = round(total_units, 4)
        existing["avg_buy_price"] = round(total_cost / total_units, 2)
        if fund.folio_number:
            existing["folio_number"] = fund.folio_number
    else:
        SAMPLE_HOLDINGS.append({
            "scheme_code": code,
            "scheme_name": fund.scheme_name.strip(),
            "units": fund.units,
            "avg_buy_price": fund.avg_buy_price,
            "folio_number": fund.folio_number,
            "purchase_date": fund.purchase_date
        })

    return {"message": "Fund registered successfully", "scheme_code": code}


@app.get("/api/tracker/watchlist")
def get_watchlist():
    results = []
    for code in INACTIVE_WATCHLIST:
        metrics = calculate_performance_metrics(code)
        if metrics:
            results.append(metrics)
    return results


@app.post("/api/tracker/watchlist")
def add_to_watchlist(item: WatchlistAdd):
    code = item.scheme_code.strip()
    if code not in INACTIVE_WATCHLIST:
        INACTIVE_WATCHLIST.append(code)
    return {"message": "Success", "code": code}


@app.get("/api/tracker/fund/{scheme_code}")
def get_fund_details(scheme_code: str):
    data = calculate_performance_metrics(scheme_code)
    if not data:
        raise HTTPException(status_code=404, detail="Scheme details not found")
    return data