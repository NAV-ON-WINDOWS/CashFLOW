from fastapi import FastAPI
from app.db.database import engine, Base
from app.models import portfolio # Import models so SQLAlchemy knows they exist

# Generate tables in MySQL if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MyCAMS Clone API")

@app.get("/")
def read_root():
    return {"message": "Mutual Fund Tracker API is running."}