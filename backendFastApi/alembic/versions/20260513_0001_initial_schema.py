"""initial loan system schema

Revision ID: 20260513_0001
Revises:
Create Date: 2026-05-13 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "20260513_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    user_role = sa.Enum("ADMIN", "USER", name="user_role")
    loan_status = sa.Enum("SOLICITADO", "DEPOSITADO", "TERMINADO", name="loan_status")
    user_role.create(op.get_bind(), checkfirst=True)
    loan_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("username", sa.String(length=80), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("document_id", sa.String(length=40), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)
    op.create_index(op.f("ix_users_document_id"), "users", ["document_id"], unique=True)

    op.create_table(
        "bank_accounts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("bank_name", sa.String(length=120), nullable=False),
        sa.Column("account_type", sa.String(length=80), nullable=False),
        sa.Column("account_number", sa.String(length=80), nullable=False),
        sa.Column("holder_name", sa.String(length=180), nullable=False),
        sa.Column("holder_document_id", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_bank_accounts_id"), "bank_accounts", ["id"], unique=False)
    op.create_index(op.f("ix_bank_accounts_user_id"), "bank_accounts", ["user_id"], unique=False)

    op.create_table(
        "loans",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("bank_account_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("number_of_installments", sa.Integer(), nullable=False),
        sa.Column("payment_start_date", sa.Date(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("status", loan_status, nullable=False),
        sa.Column("admin_observations", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["bank_account_id"], ["bank_accounts.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_loans_created_at"), "loans", ["created_at"], unique=False)
    op.create_index(op.f("ix_loans_id"), "loans", ["id"], unique=False)
    op.create_index(op.f("ix_loans_status"), "loans", ["status"], unique=False)
    op.create_index(op.f("ix_loans_user_id"), "loans", ["user_id"], unique=False)

    op.create_table(
        "loan_files",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("loan_id", sa.Integer(), nullable=False),
        sa.Column("original_name", sa.String(length=255), nullable=False),
        sa.Column("path", sa.String(length=500), nullable=False),
        sa.Column("mime_type", sa.String(length=120), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["loan_id"], ["loans.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_loan_files_id"), "loan_files", ["id"], unique=False)
    op.create_index(op.f("ix_loan_files_loan_id"), "loan_files", ["loan_id"], unique=False)

    op.create_table(
        "deposit_receipts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("loan_id", sa.Integer(), nullable=False),
        sa.Column("detail", sa.Text(), nullable=False),
        sa.Column("deposit_date", sa.Date(), nullable=False),
        sa.Column("receipt_original_name", sa.String(length=255), nullable=True),
        sa.Column("receipt_path", sa.String(length=500), nullable=True),
        sa.Column("receipt_mime_type", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["loan_id"], ["loans.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("loan_id"),
    )
    op.create_index(op.f("ix_deposit_receipts_id"), "deposit_receipts", ["id"], unique=False)
    op.create_index(op.f("ix_deposit_receipts_loan_id"), "deposit_receipts", ["loan_id"], unique=True)

    op.create_table(
        "installments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("loan_id", sa.Integer(), nullable=False),
        sa.Column("installment_number", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=False),
        sa.Column("observation", sa.Text(), nullable=True),
        sa.Column("receipt_original_name", sa.String(length=255), nullable=True),
        sa.Column("receipt_path", sa.String(length=500), nullable=True),
        sa.Column("receipt_mime_type", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["loan_id"], ["loans.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("loan_id", "installment_number", name="uq_installment_loan_number"),
    )
    op.create_index(op.f("ix_installments_id"), "installments", ["id"], unique=False)
    op.create_index(op.f("ix_installments_loan_id"), "installments", ["loan_id"], unique=False)

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("channel", sa.String(length=50), nullable=False),
        sa.Column("sent", sa.Boolean(), nullable=False),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_notifications_id"), "notifications", ["id"], unique=False)
    op.create_index(op.f("ix_notifications_user_id"), "notifications", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_notifications_user_id"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_id"), table_name="notifications")
    op.drop_table("notifications")
    op.drop_index(op.f("ix_installments_loan_id"), table_name="installments")
    op.drop_index(op.f("ix_installments_id"), table_name="installments")
    op.drop_table("installments")
    op.drop_index(op.f("ix_deposit_receipts_loan_id"), table_name="deposit_receipts")
    op.drop_index(op.f("ix_deposit_receipts_id"), table_name="deposit_receipts")
    op.drop_table("deposit_receipts")
    op.drop_index(op.f("ix_loan_files_loan_id"), table_name="loan_files")
    op.drop_index(op.f("ix_loan_files_id"), table_name="loan_files")
    op.drop_table("loan_files")
    op.drop_index(op.f("ix_loans_user_id"), table_name="loans")
    op.drop_index(op.f("ix_loans_status"), table_name="loans")
    op.drop_index(op.f("ix_loans_id"), table_name="loans")
    op.drop_index(op.f("ix_loans_created_at"), table_name="loans")
    op.drop_table("loans")
    op.drop_index(op.f("ix_bank_accounts_user_id"), table_name="bank_accounts")
    op.drop_index(op.f("ix_bank_accounts_id"), table_name="bank_accounts")
    op.drop_table("bank_accounts")
    op.drop_index(op.f("ix_users_document_id"), table_name="users")
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_table("users")
    sa.Enum(name="loan_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="user_role").drop(op.get_bind(), checkfirst=True)
