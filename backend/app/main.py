from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.amfi_fetcher import get_latest_nav
from app.services.portfolio_calculator import calculate_portfolio_valuation

app = FastAPI(title="MyCAMS Clone API")

# Temporary in-memory list of active holdings (Sample MFs)
SAMPLE_PORTFOLIO = [
    {
        "scheme_code": "120503", # Parag Parikh Flexi Cap Fund - Direct Growth
        "scheme_name": "Parag Parikh Flexi Cap Fund Direct Growth",
        "units": 125.40,
        "avg_buy_price": 65.20
    },
    {
        "scheme_code": "118834", # Mirae Asset Large & Midcap Fund - Direct Growth
        "scheme_name": "Mirae Asset Large & Midcap Fund Direct Growth",
        "units": 210.00,
        "avg_buy_price": 102.50
    },
    {
        "scheme_code": "125354", # Quant Small Cap Fund - Direct Plan - Growth
        "scheme_name": "Quant Small Cap Fund Direct Growth",
        "units": 85.12,
        "avg_buy_price": 180.10
    }
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
    """Calculates live valuation for currently active holdings."""
    return calculate_portfolio_valuation(SAMPLE_PORTFOLIO)

@app.post("/api/portfolio/calculate")
def calculate_custom_portfolio(holdings: List[HoldingInput]):
    """Accepts any list of holdings and returns full portfolio valuation."""
    holdings_dict = [h.model_dump() for h in holdings]
    return calculate_portfolio_valuation(holdings_dict)