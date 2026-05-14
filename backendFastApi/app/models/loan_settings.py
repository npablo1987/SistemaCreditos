from sqlalchemy import Column, Integer, Numeric, DateTime
from sqlalchemy.sql import func
from app.models.base import Base


class LoanSettings(Base):
    __tablename__ = "loan_settings"

    id = Column(Integer, primary_key=True, index=True)
    min_amount = Column(Numeric(12, 2), nullable=False, default=100000)
    max_amount = Column(Numeric(12, 2), nullable=False, default=5000000)
    min_installments = Column(Integer, nullable=False, default=3)
    max_installments = Column(Integer, nullable=False, default=36)
    interest_rate = Column(Numeric(5, 4), nullable=False, default=0.05)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
