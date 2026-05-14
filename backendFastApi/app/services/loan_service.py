from datetime import date
from dateutil.relativedelta import relativedelta
from decimal import Decimal

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.bank_account import BankAccount
from app.models.deposit_receipt import DepositReceipt
from app.models.enums import LoanStatus, UserRole
from app.models.installment import Installment
from app.models.loan import Loan
from app.models.loan_file import LoanFile
from app.models.user import User
from app.schemas.loan import LoanCreate, LoanDeposit, LoanUpdateStatus
from app.services.email_service import email_service
from app.services.storage_service import storage_service
from app.crud import loan_settings as crud_settings


def ensure_loan_access(user: User, loan: Loan) -> None:
    if user.role != UserRole.ADMIN and loan.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene acceso a este préstamo")


async def create_loan(db: Session, user: User, data: LoanCreate, files: list[UploadFile] | None = None) -> Loan:
    account = db.get(BankAccount, data.bank_account_id)
    if not account or account.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta bancaria inválida")
    loan = Loan(user_id=user.id, **data.model_dump())
    db.add(loan)
    db.flush()
    for file in files or []:
        path, mime_type, original_name = await storage_service.save_upload(file, f"loans/{loan.id}")
        db.add(LoanFile(loan_id=loan.id, original_name=original_name, path=path, mime_type=mime_type))
    db.commit()
    db.refresh(loan)
    email_service.send_email(
        db,
        user,
        "Solicitud de préstamo recibida",
        f"Su solicitud de préstamo #{loan.id} por {loan.amount} fue creada correctamente y está en estado {loan.status}.",
    )
    db.refresh(loan)
    return loan


async def deposit_loan(db: Session, loan: Loan, data: LoanDeposit, receipt: UploadFile | None = None) -> Loan:
    path = mime_type = original_name = None
    if receipt:
        path, mime_type, original_name = await storage_service.save_upload(receipt, f"loans/{loan.id}/deposit")
    loan.status = LoanStatus.DEPOSITADO
    loan.admin_observations = data.admin_observations
    if loan.deposit_receipt:
        loan.deposit_receipt.detail = data.detail
        loan.deposit_receipt.deposit_date = data.deposit_date
        if path:
            loan.deposit_receipt.receipt_path = path
            loan.deposit_receipt.receipt_mime_type = mime_type
            loan.deposit_receipt.receipt_original_name = original_name
    else:
        db.add(
            DepositReceipt(
                loan_id=loan.id,
                detail=data.detail,
                deposit_date=data.deposit_date,
                receipt_path=path,
                receipt_mime_type=mime_type,
                receipt_original_name=original_name,
            )
        )
    db.add(loan)
    db.commit()
    db.refresh(loan)
    
    # Generar cuotas automáticamente si no existen
    if not loan.installments:
        generate_installments(db, loan)
    
    email_service.send_email(
        db,
        loan.user,
        "Préstamo depositado",
        f"Su préstamo #{loan.id} fue depositado. Monto: {loan.amount}. Fecha: {data.deposit_date}. Estado: {loan.status}. Detalle: {data.detail}",
        path,
    )
    db.refresh(loan)
    return loan


def update_loan_status(db: Session, loan: Loan, data: LoanUpdateStatus) -> Loan:
    loan.status = data.status
    loan.admin_observations = data.admin_observations
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


def generate_installments(db: Session, loan: Loan) -> None:
    """
    Genera automáticamente las cuotas del préstamo.
    Cada cuota vence el último día del mes.
    """
    # Obtener la tasa de interés de la configuración
    settings = crud_settings.get_loan_settings(db)
    interest_rate = float(settings.interest_rate)
    
    # Calcular el monto de cada cuota con interés
    principal = float(loan.amount)
    total_with_interest = principal * (1 + interest_rate)
    installment_amount = Decimal(total_with_interest / loan.number_of_installments).quantize(Decimal('0.01'))
    
    # Fecha de inicio
    current_date = loan.payment_start_date
    
    # Generar cada cuota
    for i in range(1, loan.number_of_installments + 1):
        # Calcular fecha de vencimiento: último día del mes
        # Avanzar al mes correspondiente
        due_date = current_date + relativedelta(months=i-1)
        # Obtener el último día del mes
        last_day = (due_date + relativedelta(months=1, day=1)) - relativedelta(days=1)
        
        installment = Installment(
            loan_id=loan.id,
            installment_number=i,
            amount=installment_amount,
            payment_date=current_date + relativedelta(months=i-1),
            due_date=last_day.date() if hasattr(last_day, 'date') else last_day,
            is_paid=False
        )
        db.add(installment)
    
    db.commit()
