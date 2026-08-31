from fastapi import FastAPI, HTTPException
from app.services.amfi_fetcher import get_latest_nav

app = FastAPI(title="MyCAMS Clone API")

@app.get("/")
def read_root():
    return {"message": "API is running. Database is paused."}

@app.get("/api/nav/{scheme_code}")
def fetch_nav(scheme_code: str):
    data = get_latest_nav(scheme_code)
    if not data:
        raise HTTPException(status_code=404, detail="Fund not found or AMFI is down")
    return data