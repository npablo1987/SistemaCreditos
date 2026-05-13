from datetime import date
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select

from app.api.deps import AdminUser, CurrentUser, DbSession
from app.models.enums import UserRole
from app.models.installment import Installment
from app.models.loan import Loan
from app.schemas.installment import InstallmentCreate, InstallmentRead
from app.services.loan_service import ensure_loan_access
from app.services.storage_service import storage_service

router = APIRouter(prefix="/loans/{loan_id}/installments", tags=["installments"])


@router.post("", response_model=InstallmentRead, status_code=status.HTTP_201_CREATED)
async def register_installment_payment(
    db: DbSession,
    _: AdminUser,
    loan_id: int,
    installment_number: Annotated[int, Form(ge=1)],
    amount: Annotated[Decimal, Form(gt=0)],
    payment_date: Annotated[date, Form()],
    observation: Annotated[str | None, Form()] = None,
    receipt: Annotated[UploadFile | None, File()] = None,
) -> Installment:
    loan = db.get(Loan, loan_id)
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Préstamo no encontrado")
    payload = InstallmentCreate(
        installment_number=installment_number,
        amount=amount,
        payment_date=payment_date,
        observation=observation,
    )
    path = mime_type = original_name = None
    if receipt:
        path, mime_type, original_name = await storage_service.save_upload(receipt, f"loans/{loan_id}/installments")
    installment = Installment(
        loan_id=loan_id,
        **payload.model_dump(),
        receipt_path=path,
        receipt_mime_type=mime_type,
        receipt_original_name=original_name,
    )
    db.add(installment)
    db.commit()
    db.refresh(installment)
    return installment


@router.get("", response_model=list[InstallmentRead])
def list_installments(db: DbSession, current_user: CurrentUser, loan_id: int) -> list[Installment]:
    loan = db.get(Loan, loan_id)
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Préstamo no encontrado")
    ensure_loan_access(current_user, loan)
    return list(db.scalars(select(Installment).where(Installment.loan_id == loan_id).order_by(Installment.installment_number)))


@router.get("/mine", response_model=list[InstallmentRead], include_in_schema=False)
def list_my_paid_installments(db: DbSession, current_user: CurrentUser) -> list[Installment]:
    stmt = select(Installment).join(Loan)
    if current_user.role != UserRole.ADMIN:
        stmt = stmt.where(Loan.user_id == current_user.id)
    return list(db.scalars(stmt.order_by(Installment.payment_date.desc())))
