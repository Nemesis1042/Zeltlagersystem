from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Participant, Registration
from app.schemas.schemas import Participant as ParticipantSchema

router = APIRouter()

@router.get("/")
def get_participants(camp_id: int, db: Session = Depends(get_db)):
    """Get all participants for a camp."""
    participants = db.query(Participant).filter(Participant.camp_id == camp_id).all()
    return participants

@router.get("/{participant_id}")
def get_participant(participant_id: int, db: Session = Depends(get_db)):
    """Get participant by ID with all details."""
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return participant

@router.put("/{participant_id}")
def update_participant(
    participant_id: int,
    data: ParticipantSchema,
    db: Session = Depends(get_db)
):
    """Update participant."""
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(participant, field, value)

    db.commit()
    db.refresh(participant)
    return participant

@router.get("/{participant_id}/details")
def get_participant_details(participant_id: int, db: Session = Depends(get_db)):
    """Get full participant details including registration data."""
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    registration = db.query(Registration).filter(
        Registration.id == participant.registration_id
    ).first()

    return {
        "participant": participant,
        "registration": registration
    }
