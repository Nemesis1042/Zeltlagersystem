from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Registration, User, Camp
from app.schemas.schemas import RegistrationCreate, Registration as RegistrationSchema

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
        user = User(
            email=registration.sorge_email,
            vorname=registration.sorge_vorname,
            nachname=registration.sorge_familienname,
            telefon=registration.sorge_telefon_mobil,
            role="eltern"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user = existing_user

    # Create registration
    db_registration = Registration(
        camp_id=camp.id,
        user_id=user.id,
        **registration.dict()
    )
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)

    return db_registration

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
