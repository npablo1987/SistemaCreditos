from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal


class LoanSettingsBase(BaseModel):
    min_amount: Decimal = Field(..., gt=0, description="Monto mínimo permitido")
    max_amount: Decimal = Field(..., gt=0, description="Monto máximo permitido")
    min_installments: int = Field(..., gt=0, description="Número mínimo de cuotas")
    max_installments: int = Field(..., gt=0, description="Número máximo de cuotas")
    interest_rate: Decimal = Field(..., ge=0, le=1, description="Tasa de interés (0-1)")


class LoanSettingsCreate(LoanSettingsBase):
    pass


class LoanSettingsUpdate(BaseModel):
    min_amount: Decimal | None = Field(None, gt=0)
    max_amount: Decimal | None = Field(None, gt=0)
    min_installments: int | None = Field(None, gt=0)
    max_installments: int | None = Field(None, gt=0)
    interest_rate: Decimal | None = Field(None, ge=0, le=1)


class LoanSettingsResponse(LoanSettingsBase):
    id: int
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
