import logging
import smtplib
from email.message import EmailMessage
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.notification import Notification
from app.models.user import User

logger = logging.getLogger(__name__)


class EmailService:
    def send_email(
        self,
        db: Session,
        user: User,
        subject: str,
        body: str,
        attachment_path: str | None = None,
    ) -> Notification:
        notification = Notification(user_id=user.id, subject=subject, body=body, channel="email", sent=False)
        db.add(notification)
        db.flush()
        if not settings.EMAILS_ENABLED:
            logger.info("Email disabled. Notification %s queued for %s", notification.id, user.email)
            db.commit()
            db.refresh(notification)
            return notification
        try:
            message = EmailMessage()
            message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            message["To"] = user.email
            message["Subject"] = subject
            message.set_content(body)
            if attachment_path:
                path = Path(attachment_path)
                if path.exists():
                    message.add_attachment(path.read_bytes(), maintype="application", subtype="octet-stream", filename=path.name)
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
                if settings.SMTP_TLS:
                    smtp.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                smtp.send_message(message)
            notification.sent = True
        except Exception as exc:  # noqa: BLE001 - store email delivery error without breaking the business transaction
            notification.error = str(exc)
            logger.exception("Could not send email to %s", user.email)
        db.commit()
        db.refresh(notification)
        return notification


email_service = EmailService()
