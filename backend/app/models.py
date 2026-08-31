from sqlalchemy import Column, Integer, String, Float
from app.database import Base

# Table 1: Your Active Portfolio Holdings
class Holding(Base):
    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)
    scheme_code = Column(String, unique=True, index=True)
    scheme_name = Column(String)
    units = Column(Float)
    avg_buy_price = Column(Float)
    folio_number = Column(String, default="FOLIO-DEFAULT")
    purchase_date = Column(String, nullable=True)

# Table 2: Your Inactive Tracked Watchlist
class WatchlistItem(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    scheme_code = Column(String, unique=True, index=True)