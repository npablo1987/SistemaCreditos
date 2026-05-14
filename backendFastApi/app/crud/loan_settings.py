from sqlalchemy.orm import Session
from app.models.loan_settings import LoanSettings
from app.schemas.loan_settings import LoanSettingsCreate, LoanSettingsUpdate


def get_loan_settings(db: Session) -> LoanSettings:
    """
    Obtiene la configuración de préstamos.
    Si no existe, crea una con valores por defecto.
    """
    settings = db.query(LoanSettings).first()
    if not settings:
        # Crear configuración por defecto
        settings = LoanSettings(
            min_amount=100000,
            max_amount=5000000,
            min_installments=3,
            max_installments=36,
            interest_rate=0.05
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_loan_settings(
    db: Session,
    settings_update: LoanSettingsUpdate
) -> LoanSettings:
    """
    Actualiza la configuración de préstamos.
    """
    settings = get_loan_settings(db)
    
    update_data = settings_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings


def create_loan_settings(
    db: Session,
    settings_create: LoanSettingsCreate
) -> LoanSettings:
    """
    Crea la configuración inicial de préstamos.
    """
    settings = LoanSettings(**settings_create.model_dump())
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings
