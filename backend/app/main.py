from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.amfi_fetcher import get_latest_nav
from app.services.portfolio_calculator import calculate_portfolio_valuation
from app.services.historical_tracker import calculate_performance_metrics
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="MyCAMS Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.6:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active Portfolio Holdings (Feature B)
SAMPLE_PORTFOLIO = [
    {
        "scheme_code": "120503",
        "scheme_name": "Parag Parikh Flexi Cap Fund Direct Growth",
        "units": 125.40,
        "avg_buy_price": 65.20
    },
    {
        "scheme_code": "118834",
        "scheme_name": "Mirae Asset Large & Midcap Fund Direct Growth",
        "units": 210.00,
        "avg_buy_price": 102.50
    },
    {
        "scheme_code": "125354",
        "scheme_name": "Quant Small Cap Fund Direct Growth",
        "units": 85.12,
        "avg_buy_price": 180.10
    }
]

# Inactive / Monitored Watchlist (Feature A)
INACTIVE_WATCHLIST = [
    "120716",  # UTI Nifty 50 Index Fund - Direct Growth
    "118989",  # HDFC Mid-Cap Opportunities Fund - Direct Growth
    "120503",  # Axis ELSS Tax Saver Direct Plan - Growth
]

class HoldingInput(BaseModel):
    scheme_code: str
    scheme_name: Optional[str] = "Custom Fund"
    units: float
    avg_buy_price: float

@app.get("/")
def read_root():
    return {"message": "Mutual Fund Tracker API is running."}

@app.get("/api/nav/{scheme_code}")
def fetch_nav(scheme_code: str):
    data = get_latest_nav(scheme_code)
    if not data:
        raise HTTPException(status_code=404, detail="Fund not found or AMFI is down")
    return data

@app.get("/api/portfolio")
def get_current_portfolio():
    return calculate_portfolio_valuation(SAMPLE_PORTFOLIO)

@app.post("/api/portfolio/calculate")
def calculate_custom_portfolio(holdings: List[HoldingInput]):
    holdings_dict = [h.model_dump() for h in holdings]
    return calculate_portfolio_valuation(holdings_dict)

# --- Feature A: Inactive & Historical Tracking ---

@app.get("/api/tracker/watchlist")
def get_watchlist_summary():
    """Returns return metrics for all inactive tracked funds."""
    results = []
    for code in INACTIVE_WATCHLIST:
        metrics = calculate_performance_metrics(code)
        if metrics:
            results.append({
                "scheme_code": metrics["scheme_code"],
                "scheme_name": metrics["scheme_name"],
                "category": metrics["category"],
                "latest_nav": metrics["latest_nav"],
                "metrics": metrics["metrics"]
            })
    return results

@app.get("/api/tracker/fund/{scheme_code}")
def get_fund_tracking_detail(scheme_code: str):
    """Returns detailed metrics and 1-year historical chart points for a fund."""
    result = calculate_performance_metrics(scheme_code)
    if not result:
        raise HTTPException(status_code=404, detail="Historical fund data not found")
    return result