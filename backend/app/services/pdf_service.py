from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
from io import BytesIO
import base64
import logging

logger = logging.getLogger(__name__)

class PDFService:
    """Service zum Generieren von PDF-Dokumenten"""

    @staticmethod
    def generate_registration_pdf(registration_data: dict, signature_sorge: str = None, signature_tn: str = None):
        """Generiere PDF aus Anmeldungsdaten"""
        try:
            # BytesIO Buffer für PDF
            buffer = BytesIO()

            # PDF Document
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=1*cm,
                leftMargin=1*cm,
                topMargin=1*cm,
                bottomMargin=1*cm
            )

            # Styles
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#0B132B'),
                spaceAfter=6,
                alignment=TA_CENTER
            )
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=14,
                textColor=colors.HexColor('#0B132B'),
                spaceAfter=12,
                spaceBefore=12
            )

            # Elements
            elements = []

            # Header
            elements.append(Paragraph("BULA2026 Zeltlager-Anmeldung", title_style))
            elements.append(Spacer(1, 0.3*cm))

            # Datum
            current_date = datetime.now().strftime("%d.%m.%Y %H:%M")
            elements.append(Paragraph(f"Anmeldedatum: {current_date}", styles['Normal']))
            elements.append(Spacer(1, 0.5*cm))

            # Teilnehmer Daten
            elements.append(Paragraph("👤 Teilnehmer/in", heading_style))
            tn_data = [
                ['Familienname:', registration_data.get('tn_familienname', '')],
                ['Vorname:', registration_data.get('tn_vorname', '')],
                ['Geburtsdatum:', registration_data.get('tn_geburtsdatum', '')],
                ['Geschlecht:', registration_data.get('tn_geschlecht', '')],
                ['Adresse:', f"{registration_data.get('tn_strasse', '')} {registration_data.get('tn_plz', '')} {registration_data.get('tn_ort', '')}"],
            ]
            tn_table = Table(tn_data, colWidths=[3*cm, 14*cm])
            tn_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E8EEF7')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            elements.append(tn_table)
            elements.append(Spacer(1, 0.5*cm))

            # Sorgeberechtigte Daten
            elements.append(Paragraph("👨‍👩‍👦 Sorgeberechtigte(r)", heading_style))
            sorge_data = [
                ['Name:', f"{registration_data.get('sorge_anrede', '')} {registration_data.get('sorge_vorname', '')} {registration_data.get('sorge_familienname', '')}"],
                ['Adresse:', f"{registration_data.get('sorge_strasse', '')} {registration_data.get('sorge_plz', '')} {registration_data.get('sorge_ort', '')}"],
                ['Telefon (Mobil):', registration_data.get('sorge_telefon_mobil', '')],
                ['Email:', registration_data.get('sorge_email', '')],
            ]
            sorge_table = Table(sorge_data, colWidths=[3*cm, 14*cm])
            sorge_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E8EEF7')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            elements.append(sorge_table)
            elements.append(Spacer(1, 0.5*cm))

            # Notfallkontakt
            elements.append(Paragraph("☎️ Notfallkontakt", heading_style))
            notfall_data = [
                ['Name:', registration_data.get('notfall_name', '')],
                ['Telefon:', registration_data.get('notfall_telefon', '')],
                ['Beziehung:', registration_data.get('notfall_beziehung', '')],
            ]
            notfall_table = Table(notfall_data, colWidths=[3*cm, 14*cm])
            notfall_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E8EEF7')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            elements.append(notfall_table)
            elements.append(Spacer(1, 0.5*cm))

            # Gesundheit
            elements.append(Paragraph("🏥 Gesundheit", heading_style))
            allergien = registration_data.get('allergien', 'Keine')
            ernährung = []
            if registration_data.get('vegetarier'):
                ernährung.append('Vegetarisch')
            if registration_data.get('vegan'):
                ernährung.append('Vegan')
            if registration_data.get('kein_schweinefleisch'):
                ernährung.append('Kein Schweinefleisch')

            health_data = [
                ['Allergien:', allergien if allergien else 'Keine'],
                ['Ernährung:', ', '.join(ernährung) if ernährung else 'Normal'],
                ['Medikamente:', registration_data.get('medikamente', 'Keine') if registration_data.get('medikamente') else 'Keine'],
                ['Schwimmer:', 'Ja' if registration_data.get('schwimmer') else 'Nein'],
            ]
            health_table = Table(health_data, colWidths=[3*cm, 14*cm])
            health_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E8EEF7')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ]))
            elements.append(health_table)
            elements.append(Spacer(1, 0.5*cm))

            # Einwilligungen
            elements.append(Paragraph("✓ Einwilligungen", heading_style))
            consent_text = "Folgende Einwilligungen wurden erteilt:\n"
            if registration_data.get('foto_einwilligung'):
                consent_text += "✓ Foto-Einwilligung\n"
            if registration_data.get('rki_gelesen'):
                consent_text += "✓ RKI-Empfehlungen gelesen\n"
            if registration_data.get('gesundheit_bestaetigung'):
                consent_text += "✓ Gesundheitsbestätigung\n"
            if registration_data.get('medikamente_gabe_erlaubnis'):
                consent_text += "✓ Medikamenten-Gabe Erlaubnis\n"

            elements.append(Paragraph(consent_text, styles['Normal']))
            elements.append(Spacer(1, 0.5*cm))

            # Unterschriften
            elements.append(PageBreak())
            elements.append(Paragraph("📝 Unterschriften", heading_style))

            if signature_sorge:
                try:
                    # Decode base64 signature
                    img_data = base64.b64decode(signature_sorge.split(',')[1])
                    sig_buffer = BytesIO(img_data)
                    sig_img = Image(sig_buffer, width=8*cm, height=2.5*cm)
                    elements.append(Paragraph("Unterschrift Sorgeberechtigte(r):", styles['Normal']))
                    elements.append(sig_img)
                    elements.append(Spacer(1, 0.3*cm))
                except Exception as e:
                    logger.warning(f"Fehler beim Einbinden der Sorgeberechtigen-Signatur: {str(e)}")

            if signature_tn:
                try:
                    # Decode base64 signature
                    img_data = base64.b64decode(signature_tn.split(',')[1])
                    sig_buffer = BytesIO(img_data)
                    sig_img = Image(sig_buffer, width=8*cm, height=2.5*cm)
                    elements.append(Paragraph("Unterschrift Teilnehmer/in:", styles['Normal']))
                    elements.append(sig_img)
                except Exception as e:
                    logger.warning(f"Fehler beim Einbinden der TN-Signatur: {str(e)}")

            elements.append(Spacer(1, 1*cm))
            elements.append(Paragraph(f"Ort & Datum: {current_date}", styles['Normal']))

            # PDF generieren
            doc.build(elements)

            # Buffer zu bytes
            buffer.seek(0)
            return buffer.getvalue()

        except Exception as e:
            logger.error(f"Fehler beim PDF-Generieren: {str(e)}")
            raise
