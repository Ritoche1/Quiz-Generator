import os
from email.message import EmailMessage
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import aiosmtplib

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() in {"1", "true", "yes"}
SMTP_SENDER = os.getenv("SMTP_SENDER", SMTP_USERNAME)
PASSWORD_RESET_URL = os.getenv("PASSWORD_RESET_URL", "https://quiz.ritoche.site/reset-password")


async def send_password_reset_email(recipient: str, token: str) -> bool:
    """Send password reset email. Returns True if email sent, False if skipped."""
    if not all([SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, SMTP_SENDER]):
        return False

    reset_link = build_reset_link(token)

    message = EmailMessage()
    message["From"] = SMTP_SENDER
    message["To"] = recipient
    message["Subject"] = "Quiz Generator - Password reset instructions"
    message.set_content(
        (
            "Hi,\n\n"
            "We received a request to reset your Quiz Generator password. "
            "Use the link below to choose a new password.\n\n"
            f"Reset link: {reset_link}\n\n"
            "If you did not request this change, you can ignore this message."
        )
    )

    try:
        if SMTP_USE_TLS:
            await aiosmtplib.send(
                message,
                hostname=SMTP_HOST,
                port=SMTP_PORT,
                username=SMTP_USERNAME,
                password=SMTP_PASSWORD,
                start_tls=True,
            )
        else:
            await aiosmtplib.send(
                message,
                hostname=SMTP_HOST,
                port=SMTP_PORT,
                username=SMTP_USERNAME,
                password=SMTP_PASSWORD,
                start_tls=False,
            )
        return True
    except Exception:
        return False


def build_reset_link(token: str) -> str:
    parsed = urlparse(PASSWORD_RESET_URL)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    query["token"] = token
    new_query = urlencode(query)
    return urlunparse(parsed._replace(query=new_query))
