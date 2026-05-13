from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Installment(Base):
    __tablename__ = "installments"
    __table_args__ = (UniqueConstraint("loan_id", "installment_number", name="uq_installment_loan_number"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    loan_id: Mapped[int] = mapped_column(ForeignKey("loans.id", ondelete="CASCADE"), index=True, nullable=False)
    installment_number: Mapped[int] = mapped_column(nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    observation: Mapped[str | None] = mapped_column(Text)
    receipt_original_name: Mapped[str | None] = mapped_column(String(255))
    receipt_path: Mapped[str | None] = mapped_column(String(500))
    receipt_mime_type: Mapped[str | None] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    loan = relationship("Loan", back_populates="installments")
