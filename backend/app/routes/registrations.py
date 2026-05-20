from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.models import Registration, User, Camp, Participant
from app.schemas.schemas import RegistrationCreate, Registration as RegistrationSchema
from app.services.email_service import EmailService
from app.services.pdf_service import PDFService
from datetime import datetime
import base64

router = APIRouter()

@router.post("/")
def create_registration(
    registration: RegistrationCreate,
    db: Session = Depends(get_db)
):
    """Create new registration (public endpoint)."""
    # Get default camp (first active camp)
    camp = db.query(Camp).filter(Camp.active == True).first()
    if not camp:
        raise HTTPException(status_code=400, detail="No active camp")

    # Create user account (using sorgeberechtigte email)
    existing_user = db.query(User).filter(User.email == registration.sorge_email).first()
    if not existing_user:
        # Generate temporary password
        temp_password = "TempPassword123!"  # In production, use secure generation

        user = User(
            email=registration.sorge_email,
            vorname=registration.sorge_vorname,
            nachname=registration.sorge_familienname,
            telefon=registration.sorge_telefon_mobil,
            password_hash=get_password_hash(temp_password),
            role="eltern"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user = existing_user

    # Convert signatures from base64 if provided
    reg_data = registration.dict()
    if reg_data.get('sig_sorge'):
        # Store as binary (will be stored in DB)
        reg_data['sig_sorge'] = reg_data['sig_sorge'].encode('utf-8')
    if reg_data.get('sig_tn'):
        reg_data['sig_tn'] = reg_data['sig_tn'].encode('utf-8')

    # Create registration
    db_registration = Registration(
        camp_id=camp.id,
        user_id=user.id,
        **reg_data
    )
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)

    # Create participant entry
    participant = Participant(
        camp_id=camp.id,
        user_id=user.id,
        registration_id=db_registration.id
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)

    # Generate PDF
    try:
        sig_sorge_str = registration.sig_sorge if registration.sig_sorge else None
        sig_tn_str = registration.sig_tn if registration.sig_tn else None

        pdf_bytes = PDFService.generate_registration_pdf(
            registration_data=registration.dict(),
            signature_sorge=sig_sorge_str,
            signature_tn=sig_tn_str
        )

        # Send confirmation email
        EmailService.send_registration_confirmation(
            email=registration.sorge_email,
            name=f"{registration.sorge_vorname} {registration.sorge_familienname}",
            registration_id=db_registration.id
        )
    except Exception as e:
        # Log error but don't fail the registration
        print(f"Error generating PDF or sending email: {str(e)}")

    return {
        "id": db_registration.id,
        "status": "angemeldet",
        "message": "Anmeldung erfolgreich! Überprüfe dein Email-Postfach für die Bestätigung.",
        "registration_id": db_registration.id
    }

@router.get("/{registration_id}")
def get_registration(
    registration_id: int,
    db: Session = Depends(get_db)
):
    """Get registration by ID."""
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    return registration

@router.put("/{registration_id}")
def update_registration(
    registration_id: int,
    registration_data: RegistrationCreate,
    db: Session = Depends(get_db)
):
    """Update registration."""
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    for field, value in registration_data.dict(exclude_unset=True).items():
        setattr(registration, field, value)

    db.commit()
    db.refresh(registration)
    return registration

@router.delete("/{registration_id}")
def delete_registration(registration_id: int, db: Session = Depends(get_db)):
    """Delete registration."""
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    db.delete(registration)
    db.commit()
    return {"message": "Registration deleted"}

@router.get("/{registration_id}/pdf")
def get_registration_pdf(registration_id: int, db: Session = Depends(get_db)):
    """Download registration as PDF."""
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    try:
        # Prepare registration data
        reg_dict = {
            'tn_familienname': registration.tn_familienname,
            'tn_vorname': registration.tn_vorname,
            'tn_strasse': registration.tn_strasse,
            'tn_plz': registration.tn_plz,
            'tn_ort': registration.tn_ort,
            'tn_geburtsdatum': str(registration.tn_geburtsdatum),
            'tn_geschlecht': registration.tn_geschlecht,
            'sorge_anrede': registration.sorge_anrede,
            'sorge_vorname': registration.sorge_vorname,
            'sorge_familienname': registration.sorge_familienname,
            'sorge_strasse': registration.sorge_strasse,
            'sorge_plz': registration.sorge_plz,
            'sorge_ort': registration.sorge_ort,
            'sorge_email': registration.sorge_email,
            'sorge_telefon_mobil': registration.sorge_telefon_mobil,
            'notfall_name': registration.notfall_name,
            'notfall_telefon': registration.notfall_telefon,
            'notfall_beziehung': registration.notfall_beziehung,
            'allergien': registration.allergien,
            'vegetarier': registration.vegetarier,
            'vegan': registration.vegan,
            'kein_schweinefleisch': registration.kein_schweinefleisch,
            'medikamente': registration.medikamente,
            'schwimmer': registration.schwimmer,
            'foto_einwilligung': registration.foto_einwilligung,
            'rki_gelesen': registration.rki_gelesen,
            'gesundheit_bestaetigung': registration.gesundheit_bestaetigung,
            'medikamente_gabe_erlaubnis': registration.medikamente_gabe_erlaubnis,
        }

        # Get signatures
        sig_sorge_str = None
        sig_tn_str = None
        if registration.sig_sorge:
            try:
                sig_sorge_str = registration.sig_sorge.decode('utf-8')
            except:
                pass
        if registration.sig_tn:
            try:
                sig_tn_str = registration.sig_tn.decode('utf-8')
            except:
                pass

        # Generate PDF
        pdf_bytes = PDFService.generate_registration_pdf(
            registration_data=reg_dict,
            signature_sorge=sig_sorge_str,
            signature_tn=sig_tn_str
        )

        return FileResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            filename=f"BULA2026_Anmeldung_{registration_id}.pdf"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

# Admin endpoints
@router.get("/admin/all")
def get_all_registrations(db: Session = Depends(get_db)):
    """Get all registrations (admin only)."""
    registrations = db.query(Registration).all()
    return registrations

@router.put("/admin/{registration_id}/status")
def update_registration_status(
    registration_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update registration status (admin only)."""
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    registration.status = status
    db.commit()
    db.refresh(registration)
    return registration
