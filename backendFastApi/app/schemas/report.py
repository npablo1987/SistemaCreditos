from decimal import Decimal

from pydantic import BaseModel


class ReportSummary(BaseModel):
    period: str
    total_lent: Decimal
    total_paid: Decimal
    active_loans: int
    finished_loans: int
