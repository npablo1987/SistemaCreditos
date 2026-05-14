from decimal import Decimal

from pydantic import BaseModel


class ReportSummary(BaseModel):
    period: str
    total_lent: Decimal
    total_paid: Decimal
    active_loans: int
    finished_loans: int


class MonthlyReport(BaseModel):
    month: str
    year: int
    total_loaned: Decimal
    total_paid: Decimal
    interest_earned: Decimal
    pending_installments: int
    loans_approved: int
    loans_rejected: int
