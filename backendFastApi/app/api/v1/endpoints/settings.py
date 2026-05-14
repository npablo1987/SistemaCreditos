from fastapi import APIRouter, HTTPException

from app.api.deps import AdminUser, CurrentUser, DbSession
from app.schemas.loan_settings import LoanSettingsResponse, LoanSettingsUpdate
from app.crud import loan_settings as crud_settings

router = APIRouter()


@router.get("/loan", response_model=LoanSettingsResponse)
def get_loan_settings(
    db: DbSession,
    current_user: CurrentUser
):
    """
    Obtiene la configuración actual de préstamos.
    Disponible para todos los usuarios autenticados.
    """
    settings = crud_settings.get_loan_settings(db)
    return settings


@router.put("/loan", response_model=LoanSettingsResponse)
def update_loan_settings(
    settings_update: LoanSettingsUpdate,
    db: DbSession,
    admin_user: AdminUser
):
    """
    Actualiza la configuración de préstamos.
    Solo disponible para administradores.
    """
    
    # Validar que min sea menor que max
    settings = crud_settings.get_loan_settings(db)
    
    min_amount = settings_update.min_amount if settings_update.min_amount is not None else settings.min_amount
    max_amount = settings_update.max_amount if settings_update.max_amount is not None else settings.max_amount
    
    if min_amount >= max_amount:
        raise HTTPException(
            status_code=400,
            detail="El monto mínimo debe ser menor que el monto máximo"
        )
    
    min_installments = settings_update.min_installments if settings_update.min_installments is not None else settings.min_installments
    max_installments = settings_update.max_installments if settings_update.max_installments is not None else settings.max_installments
    
    if min_installments >= max_installments:
        raise HTTPException(
            status_code=400,
            detail="El número mínimo de cuotas debe ser menor que el máximo"
        )
    
    updated_settings = crud_settings.update_loan_settings(db, settings_update)
    return updated_settings
