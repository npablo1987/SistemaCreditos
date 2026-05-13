from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class DepositReceipt(Base):
    __tablename__ = "deposit_receipts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    loan_id: Mapped[int] = mapped_column(ForeignKey("loans.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    detail: Mapped[str] = mapped_column(Text, nullable=False)
    deposit_date: Mapped[date] = mapped_column(Date, nullable=False)
    receipt_original_name: Mapped[str | None] = mapped_column(String(255))
    receipt_path: Mapped[str | None] = mapped_column(String(500))
    receipt_mime_type: Mapped[str | None] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    loan = relationship("Loan", back_populates="deposit_receipt")
