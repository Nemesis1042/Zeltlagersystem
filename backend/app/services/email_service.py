import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Email service für SMTP-Versand"""

    @staticmethod
    def send_registration_confirmation(email: str, name: str, registration_id: int):
        """Sende Anmeldebestätigung per Email"""
        try:
            subject = "BULA2026 - Anmeldung bestätigt ✓"
            body = f"""
Hallo {name},

vielen Dank für die Anmeldung zu BULA2026!

Deine Anmeldung wurde erfolgreich empfangen.
Anmeldungs-ID: {registration_id}

Du kannst dich jetzt mit deiner Email-Adresse anmelden:
- Email: {email}
- Passwort: (wurde separat erstellt)

Login: http://admin.lagerbank.info/login

Bei Fragen: support@bula2026.de

Viele Grüße,
Das BULA2026-Team
            """

            EmailService._send_email(email, subject, body)
            logger.info(f"Anmeldebestätigung gesendet an {email}")
            return True

        except Exception as e:
            logger.error(f"Fehler beim Versand der Anmeldebestätigung: {str(e)}")
            return False

    @staticmethod
    def send_password_reset(email: str, reset_link: str):
        """Sende Passwort-Reset Link"""
        try:
            subject = "BULA2026 - Passwort zurücksetzen"
            body = f"""
Hallo,

du hast einen Passwort-Reset angefordert.

Klick hier um dein Passwort zurückzusetzen:
{reset_link}

Dieser Link ist 1 Stunde lang gültig.

Viele Grüße,
Das BULA2026-Team
            """

            EmailService._send_email(email, subject, body)
            logger.info(f"Passwort-Reset gesendet an {email}")
            return True

        except Exception as e:
            logger.error(f"Fehler beim Versand des Passwort-Reset: {str(e)}")
            return False

    @staticmethod
    def send_check_in_reminder(email: str, participant_name: str, check_in_date: str):
        """Sende Check-In Erinnerung an Eltern"""
        try:
            subject = f"BULA2026 - Check-In für {participant_name}"
            body = f"""
Hallo,

dein Kind {participant_name} ist bei BULA2026 angekommen!

Ankunfts-Datum: {check_in_date}

Alles Weitere findest du auf dem Eltern-Dashboard.

Viele Grüße,
Das BULA2026-Team
            """

            EmailService._send_email(email, subject, body)
            logger.info(f"Check-In Erinnerung gesendet an {email}")
            return True

        except Exception as e:
            logger.error(f"Fehler beim Versand der Check-In Erinnerung: {str(e)}")
            return False

    @staticmethod
    def send_staff_notification(email: str, subject: str, message: str):
        """Sende Benachrichtigung an Mitarbeiter"""
        try:
            EmailService._send_email(email, f"BULA2026 - {subject}", message)
            logger.info(f"Mitarbeiter-Benachrichtigung gesendet an {email}")
            return True

        except Exception as e:
            logger.error(f"Fehler beim Versand der Benachrichtigung: {str(e)}")
            return False

    @staticmethod
    def _send_email(to_email: str, subject: str, body: str, attachment=None):
        """Interne Methode zum Versand von Emails"""
        try:
            # SMTP Connection
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            server.starttls()
            server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)

            # Email erstellen
            message = MIMEMultipart()
            message['From'] = settings.EMAIL_USER
            message['To'] = to_email
            message['Subject'] = subject

            # Body
            message.attach(MIMEText(body, 'plain'))

            # Attachment (optional)
            if attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment['content'])
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f"attachment; filename= {attachment['filename']}"
                )
                message.attach(part)

            # Versenden
            server.send_message(message)
            server.quit()

            return True

        except Exception as e:
            logger.error(f"SMTP Fehler: {str(e)}")
            raise
