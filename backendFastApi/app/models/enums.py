from enum import StrEnum


class UserRole(StrEnum):
    ADMIN = "ADMIN"
    USER = "USER"


class LoanStatus(StrEnum):
    SOLICITADO = "SOLICITADO"
    DEPOSITADO = "DEPOSITADO"
    TERMINADO = "TERMINADO"
