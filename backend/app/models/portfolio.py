from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class MutualFund(Base):
    __tablename__ = "mutual_funds"
    
    id = Column(Integer, primary_key=True, index=True)
    amfi_code = Column(String(50), unique=True, index=True) 
    name = Column(String(255), index=True)
    category = Column(String(100))
    is_active = Column(Boolean, default=True)
    
    transactions = relationship("Transaction", back_populates="fund")
    nav_history = relationship("DailyNAV", back_populates="fund")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    fund_id = Column(Integer, ForeignKey("mutual_funds.id"))
    transaction_type = Column(String(10)) # 'BUY' or 'SELL'
    date = Column(Date)
    units = Column(Float)
    price_at_execution = Column(Float)
    
    fund = relationship("MutualFund", back_populates="transactions")

class DailyNAV(Base):
    __tablename__ = "daily_nav_history"
    
    id = Column(Integer, primary_key=True, index=True)
    fund_id = Column(Integer, ForeignKey("mutual_funds.id"))
    date = Column(Date, index=True)
    nav = Column(Float)
    
    fund = relationship("MutualFund", back_populates="nav_history")