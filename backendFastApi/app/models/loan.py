from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import LoanStatus


class Loan(Base):
    __tablename__ = "loans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True, nullable=False)
    bank_account_id: Mapped[int] = mapped_column(ForeignKey("bank_accounts.id", ondelete="RESTRICT"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    number_of_installments: Mapped[int] = mapped_column(nullable=False)
    payment_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)
    status: Mapped[LoanStatus] = mapped_column(
        Enum(LoanStatus, name="loan_status"), nullable=False, default=LoanStatus.SOLICITADO, index=True
    )
    admin_observations: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="loans")
    bank_account = relationship("BankAccount", back_populates="loans")
    files = relationship("LoanFile", back_populates="loan", cascade="all, delete-orphan")
    installments = relationship("Installment", back_populates="loan", cascade="all, delete-orphan")
    deposit_receipt = relationship("DepositReceipt", back_populates="loan", uselist=False, cascade="all, delete-orphan")
