from contextlib import asynccontextmanager
import logging
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import models
from app.database import engine, get_db
from app.services.amfi_fetcher import get_latest_nav
from app.services.historical_tracker import calculate_performance_metrics
from app.services.scheduler import start_scheduler, stop_scheduler, sync_active_navs

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()

app = FastAPI(title="CashFLOW API", version="1.0.0", lifespan=lifespan)

# --- 1. CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# --- 2. SECURITY HEADERS MIDDLEWARE ---
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# --- 3. GLOBAL ERROR HANDLER ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "An internal server error occurred. Please try again later."},
    )

# --- REQUEST SCHEMAS ---
class ActiveFundCreate(BaseModel):
    scheme_name: str
    scheme_code: Optional[str] = None
    units: float
    avg_buy_price: float
    folio_number: Optional[str] = "FOLIO-DEFAULT"
    purchase_date: Optional[str] = None

class ActiveFundUpdate(BaseModel):
    scheme_name: str
    scheme_code: Optional[str] = None
    units: float
    avg_buy_price: float
    folio_number: Optional[str] = "FOLIO-DEFAULT"
    purchase_date: Optional[str] = None

class WatchlistAdd(BaseModel):
    scheme_code: str

class InactiveHoldingSchema(BaseModel):
    scheme_name: str
    scheme_code: Optional[str] = None
    units: float
    avg_buy_price: float
    sell_price: float
    folio_number: Optional[str] = "FOLIO-DEFAULT"
    purchase_date: Optional[str] = None
    sell_date: Optional[str] = None

class InactiveHoldingUpdate(BaseModel):
    scheme_name: str
    scheme_code: Optional[str] = None
    units: float
    avg_buy_price: float
    sell_price: float
    folio_number: Optional[str] = "FOLIO-DEFAULT"
    purchase_date: Optional[str] = None
    sell_date: Optional[str] = None


@app.get("/")
def read_root():
    return {"status": "healthy", "service": "CashFLOW API", "scheduler": "running"}


# --- MANUAL SYNC TRIGGER ---
@app.post("/api/portfolio/sync-now")
def trigger_manual_sync():
    sync_active_navs()
    return {"status": "success", "message": "Manual NAV sync completed."}


# --- ACTIVE PORTFOLIO ENDPOINTS ---
@app.get("/api/portfolio")
def get_portfolio(db: Session = Depends(get_db)):
    total_invested = 0.0
    total_current_value = 0.0
    enriched_holdings = []

    holdings = db.query(models.Holding).all()

    for item in holdings:
        code = item.scheme_code
        units = item.units
        avg_price = item.avg_buy_price
        invested_amt = units * avg_price
        total_invested += invested_amt

        nav_info = get_latest_nav(code) if not code.startswith("CUSTOM") else None
        
        current_nav = nav_info["nav"] if (nav_info and nav_info.get("nav", 0) > 0) else avg_price
        nav_date = nav_info["date"] if nav_info else (item.purchase_date or "N/A")
        scheme_name = nav_info["scheme_name"] if nav_info else item.scheme_name

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
            "folio_number": item.folio_number,
            "purchase_date": item.purchase_date
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
def add_active_fund(fund: ActiveFundCreate, db: Session = Depends(get_db)):
    if fund.scheme_code:
        code = fund.scheme_code.strip()
    else:
        count = db.query(models.Holding).count()
        code = f"CUSTOM_{count + 1}"

    existing = db.query(models.Holding).filter(models.Holding.scheme_code == code).first()

    if existing:
        total_units = existing.units + fund.units
        total_cost = (existing.units * existing.avg_buy_price) + (fund.units * fund.avg_buy_price)
        existing.units = round(total_units, 4)
        existing.avg_buy_price = round(total_cost / total_units, 2)
        if fund.folio_number:
            existing.folio_number = fund.folio_number
    else:
        new_holding = models.Holding(
            scheme_code=code,
            scheme_name=fund.scheme_name.strip(),
            units=fund.units,
            avg_buy_price=fund.avg_buy_price,
            folio_number=fund.folio_number,
            purchase_date=fund.purchase_date
        )
        db.add(new_holding)
    
    db.commit()
    return {"message": "Fund saved to database", "scheme_code": code}


@app.put("/api/portfolio/fund/{scheme_code}")
def update_fund(scheme_code: str, payload: ActiveFundUpdate, db: Session = Depends(get_db)):
    existing = db.query(models.Holding).filter(models.Holding.scheme_code == scheme_code).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Fund not found")
    
    # Allow changing AMFI scheme_code if provided and different
    if payload.scheme_code:
        new_code = payload.scheme_code.strip()
        if new_code != scheme_code:
            conflict = db.query(models.Holding).filter(models.Holding.scheme_code == new_code).first()
            if conflict:
                raise HTTPException(status_code=400, detail="Another fund with this scheme code already exists")
            existing.scheme_code = new_code

    existing.scheme_name = payload.scheme_name.strip()
    existing.units = payload.units
    existing.avg_buy_price = payload.avg_buy_price
    existing.folio_number = payload.folio_number
    if payload.purchase_date is not None:
        existing.purchase_date = payload.purchase_date
    
    db.commit()
    return {"message": "Fund updated successfully", "scheme_code": existing.scheme_code}


@app.delete("/api/portfolio/fund/{scheme_code}")
def delete_fund(scheme_code: str, db: Session = Depends(get_db)):
    existing = db.query(models.Holding).filter(models.Holding.scheme_code == scheme_code).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Fund not found")
    
    db.delete(existing)
    db.commit()
    return {"message": "Fund deleted permanently"}


# --- WATCHLIST ENDPOINTS ---
@app.get("/api/tracker/watchlist")
def get_watchlist(db: Session = Depends(get_db)):
    watchlist_items = db.query(models.WatchlistItem).all()
    results = []
    for item in watchlist_items:
        metrics = calculate_performance_metrics(item.scheme_code)
        if metrics:
            results.append(metrics)
    return results


@app.post("/api/tracker/watchlist")
def add_to_watchlist(item: WatchlistAdd, db: Session = Depends(get_db)):
    code = item.scheme_code.strip()
    existing = db.query(models.WatchlistItem).filter(models.WatchlistItem.scheme_code == code).first()
    
    if not existing:
        new_item = models.WatchlistItem(scheme_code=code)
        db.add(new_item)
        db.commit()
        
    return {"message": "Saved to watchlist", "code": code}


@app.get("/api/tracker/fund/{scheme_code}")
def get_fund_details(scheme_code: str):
    data = calculate_performance_metrics(scheme_code)
    if not data:
        raise HTTPException(status_code=404, detail="Scheme details not found")
    return data


# --- INACTIVE (DORMANT) PORTFOLIO ENDPOINTS ---
@app.get("/api/inactive-portfolio")
def get_inactive_portfolio(db: Session = Depends(get_db)):
    total_invested = 0.0
    total_current_value = 0.0
    enriched_holdings = []

    holdings = db.query(models.InactiveHolding).all()

    for item in holdings:
        code = item.scheme_code
        units = item.units
        avg_price = item.avg_buy_price or 0
        invested_amt = units * avg_price
        total_invested += invested_amt

        nav_info = get_latest_nav(code) if code and not code.startswith("SOLD_") else None
        
        current_nav = nav_info["nav"] if (nav_info and nav_info.get("nav", 0) > 0) else avg_price
        nav_date = nav_info["date"] if nav_info else (item.purchase_date or "N/A")
        scheme_name = nav_info["scheme_name"] if nav_info else item.scheme_name

        current_val = units * current_nav
        total_current_value += current_val
        pnl = current_val - invested_amt
        returns_pct = round((pnl / invested_amt) * 100, 2) if invested_amt > 0 else 0.0

        enriched_holdings.append({
            "id": item.id,
            "scheme_code": code,
            "scheme_name": scheme_name,
            "units": units,
            "avg_buy_price": avg_price,
            "sell_price": item.sell_price,
            "current_nav": current_nav,
            "current_value": round(current_val, 2),
            "profit_loss": round(pnl, 2),
            "returns_percentage": returns_pct,
            "nav_date": nav_date,
            "folio_number": item.folio_number,
            "purchase_date": item.purchase_date,
            "sell_date": item.sell_date
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


@app.post("/api/inactive-portfolio")
def add_inactive_holding(holding: InactiveHoldingSchema, db: Session = Depends(get_db)):
    if holding.scheme_code:
        code = holding.scheme_code.strip()
    else:
        count = db.query(models.InactiveHolding).count()
        code = f"SOLD_{count + 1}"

    realized_profit = round((holding.sell_price - holding.avg_buy_price) * holding.units, 2)
    
    new_inactive = models.InactiveHolding(
        scheme_code=code,
        scheme_name=holding.scheme_name.strip(),
        units=holding.units,
        avg_buy_price=holding.avg_buy_price,
        sell_price=holding.sell_price,
        realized_profit=realized_profit,
        folio_number=holding.folio_number,
        purchase_date=holding.purchase_date,
        sell_date=holding.sell_date
    )
    db.add(new_inactive)
    db.commit()
    db.refresh(new_inactive)
    return new_inactive


@app.put("/api/inactive-portfolio/{holding_id}")
def update_inactive_holding(holding_id: int, payload: InactiveHoldingUpdate, db: Session = Depends(get_db)):
    existing = db.query(models.InactiveHolding).filter(models.InactiveHolding.id == holding_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Inactive fund record not found")
    
    if payload.scheme_code is not None:
        existing.scheme_code = payload.scheme_code.strip() if payload.scheme_code.strip() else None

    existing.scheme_name = payload.scheme_name.strip()
    existing.units = payload.units
    existing.avg_buy_price = payload.avg_buy_price
    existing.sell_price = payload.sell_price
    existing.realized_profit = round((payload.sell_price - payload.avg_buy_price) * payload.units, 2)
    existing.folio_number = payload.folio_number
    existing.purchase_date = payload.purchase_date
    existing.sell_date = payload.sell_date

    db.commit()
    return {"message": "Inactive fund updated successfully"}


@app.delete("/api/inactive-portfolio/{holding_id}")
def delete_inactive_holding(holding_id: int, db: Session = Depends(get_db)):
    db.query(models.InactiveHolding).filter(models.InactiveHolding.id == holding_id).delete()
    db.commit()
    return {"status": "deleted"}