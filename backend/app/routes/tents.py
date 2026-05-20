from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Tent, Participant
from app.schemas.schemas import TentCreate, Tent as TentSchema

router = APIRouter()

@router.post("/")
def create_tent(tent: TentCreate, camp_id: int, db: Session = Depends(get_db)):
    """Create a new tent."""
    db_tent = Tent(camp_id=camp_id, **tent.dict())
    db.add(db_tent)
    db.commit()
    db.refresh(db_tent)
    return db_tent

@router.get("/")
def get_tents(camp_id: int, db: Session = Depends(get_db)):
    """Get all tents for a camp."""
    tents = db.query(Tent).filter(Tent.camp_id == camp_id).all()
    return tents

@router.get("/{tent_id}")
def get_tent(tent_id: int, db: Session = Depends(get_db)):
    """Get tent by ID with participants."""
    tent = db.query(Tent).filter(Tent.id == tent_id).first()
    if not tent:
        raise HTTPException(status_code=404, detail="Tent not found")

    participants = db.query(Participant).filter(Participant.zelt_id == tent_id).all()
    return {
        "tent": tent,
        "participants": participants,
        "occupancy": f"{len(participants)}/{tent.capacity}"
    }

@router.put("/{tent_id}")
def update_tent(tent_id: int, tent_data: TentCreate, db: Session = Depends(get_db)):
    """Update tent."""
    tent = db.query(Tent).filter(Tent.id == tent_id).first()
    if not tent:
        raise HTTPException(status_code=404, detail="Tent not found")

    for field, value in tent_data.dict(exclude_unset=True).items():
        setattr(tent, field, value)

    db.commit()
    db.refresh(tent)
    return tent

@router.delete("/{tent_id}")
def delete_tent(tent_id: int, db: Session = Depends(get_db)):
    """Delete tent."""
    tent = db.query(Tent).filter(Tent.id == tent_id).first()
    if not tent:
        raise HTTPException(status_code=404, detail="Tent not found")

    db.delete(tent)
    db.commit()
    return {"message": "Tent deleted"}

@router.post("/{tent_id}/assign-participant/{participant_id}")
def assign_participant_to_tent(
    tent_id: int,
    participant_id: int,
    db: Session = Depends(get_db)
):
    """Assign a participant to a tent."""
    tent = db.query(Tent).filter(Tent.id == tent_id).first()
    participant = db.query(Participant).filter(Participant.id == participant_id).first()

    if not tent or not participant:
        raise HTTPException(status_code=404, detail="Tent or participant not found")

    participant.zelt_id = tent_id
    db.commit()
    db.refresh(participant)
    return participant
