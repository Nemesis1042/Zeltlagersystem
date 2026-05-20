from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.models.models import Participant, User
from app.schemas.schemas import CheckInRequest, CheckInResponse

router = APIRouter()

@router.post("/")
def check_in_participant(
    check_in: CheckInRequest,
    ma_user_id: int,  # In production, get from JWT token
    db: Session = Depends(get_db)
):
    """Check in a participant on arrival."""
    participant = db.query(Participant).filter(
        Participant.id == check_in.participant_id
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    ma = db.query(User).filter(User.id == ma_user_id).first()
    if not ma:
        raise HTTPException(status_code=404, detail="MA not found")

    # Update participant
    participant.check_in_time = datetime.utcnow()
    participant.checked_in_by_id = ma_user_id
    participant.status = "angekommen"

    db.commit()
    db.refresh(participant)

    return CheckInResponse(
        participant_id=participant.id,
        check_in_time=participant.check_in_time,
        checked_in_by=ma.vorname + " " + ma.nachname
    )

@router.get("/status/{camp_id}")
def get_check_in_status(camp_id: int, db: Session = Depends(get_db)):
    """Get check-in status for a camp."""
    participants = db.query(Participant).filter(Participant.camp_id == camp_id).all()
    checked_in = [p for p in participants if p.check_in_time is not None]

    return {
        "total": len(participants),
        "checked_in": len(checked_in),
        "pending": len(participants) - len(checked_in),
        "percentage": round((len(checked_in) / len(participants) * 100), 2) if participants else 0,
        "pending_participants": [
            {
                "id": p.id,
                "name": f"{p.registration.tn_vorname} {p.registration.tn_familienname}",
                "zelt": p.zelt.name if p.zelt else "Unassigned"
            }
            for p in participants if p.check_in_time is None
        ]
    }

@router.get("/list/{camp_id}")
def get_check_in_list(camp_id: int, db: Session = Depends(get_db)):
    """Get list of all participants for check-in."""
    participants = db.query(Participant).filter(Participant.camp_id == camp_id).all()

    return [
        {
            "id": p.id,
            "name": f"{p.registration.tn_vorname} {p.registration.tn_familienname}",
            "zelt": p.zelt.name if p.zelt else "Unassigned",
            "checked_in": p.check_in_time is not None,
            "check_in_time": p.check_in_time,
            "checked_in_by": p.checked_in_by_id
        }
        for p in sorted(participants, key=lambda x: x.registration.tn_vorname)
    ]
