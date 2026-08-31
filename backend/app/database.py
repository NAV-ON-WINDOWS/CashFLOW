from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# This tells SQLite to create a file named "portfolio.db" in your backend folder
SQLALCHEMY_DATABASE_URL = "sqlite:///./portfolio.db"

# The engine is the actual connection to the file
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# A session is a temporary workspace for a single request (like a blank page)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the master template that all our database tables will inherit from
Base = declarative_base()

# This helper function gives a database session to our routes and closes it when done
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()