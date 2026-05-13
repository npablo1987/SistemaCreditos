from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.enums import LoanStatus
from app.schemas.bank_account import BankAccountRead
from app.schemas.common import ORMBase
from app.schemas.user import UserRead


class LoanFileRead(ORMBase):
    id: int
    loan_id: int
    original_name: str
    path: str
    mime_type: str | None
    uploaded_at: datetime


class DepositReceiptRead(ORMBase):
    id: int
    loan_id: int
    detail: str
    deposit_date: date
    receipt_original_name: str | None
    receipt_path: str | None
    receipt_mime_type: str | None
    created_at: datetime


class LoanCreate(BaseModel):
    amount: Decimal = Field(..., gt=0, max_digits=14, decimal_places=2)
    number_of_installments: int = Field(..., ge=1, le=120)
    payment_start_date: date
    bank_account_id: int
    comment: str | None = None


class LoanUpdateStatus(BaseModel):
    status: LoanStatus
    admin_observations: str | None = None


class LoanDeposit(BaseModel):
    detail: str = Field(..., min_length=1)
    deposit_date: date
    admin_observations: str | None = None


class LoanRead(ORMBase):
    id: int
    user_id: int
    bank_account_id: int
    amount: Decimal
    number_of_installments: int
    payment_start_date: date
    comment: str | None
    status: LoanStatus
    admin_observations: str | None
    created_at: datetime
    updated_at: datetime | None
    files: list[LoanFileRead] = []
    deposit_receipt: DepositReceiptRead | None = None


class LoanDetail(LoanRead):
    user: UserRead
    bank_account: BankAccountRead
