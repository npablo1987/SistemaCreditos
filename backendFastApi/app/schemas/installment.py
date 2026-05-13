from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ORMBase


class InstallmentCreate(BaseModel):
    installment_number: int = Field(..., ge=1)
    amount: Decimal = Field(..., gt=0, max_digits=14, decimal_places=2)
    payment_date: date
    observation: str | None = None


class InstallmentRead(ORMBase):
    id: int
    loan_id: int
    installment_number: int
    amount: Decimal
    payment_date: date
    observation: str | None
    receipt_original_name: str | None
    receipt_path: str | None
    receipt_mime_type: str | None
    created_at: datetime
