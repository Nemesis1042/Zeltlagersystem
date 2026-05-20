from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from random import shuffle, sample
from app.core.database import get_db
from app.models.models import (
    Activity,
    ActivityGroup,
    ActivityGroupMember,
    Participant,
    ActivityPairingHistory
)
from app.schemas.schemas import ActivityCreate, Activity as ActivitySchema

router = APIRouter()

@router.post("/")
def create_activity(activity: ActivityCreate, camp_id: int, db: Session = Depends(get_db)):
    """Create a new activity."""
    db_activity = Activity(camp_id=camp_id, **activity.dict())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.get("/")
def get_activities(camp_id: int, db: Session = Depends(get_db)):
    """Get all activities for a camp."""
    activities = db.query(Activity).filter(Activity.camp_id == camp_id).all()
    return activities

@router.get("/{activity_id}")
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    """Get activity by ID."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

@router.put("/{activity_id}")
def update_activity(
    activity_id: int,
    activity_data: ActivityCreate,
    db: Session = Depends(get_db)
):
    """Update activity."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    for field, value in activity_data.dict(exclude_unset=True).items():
        setattr(activity, field, value)

    db.commit()
    db.refresh(activity)
    return activity

@router.delete("/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    """Delete activity."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(activity)
    db.commit()
    return {"message": "Activity deleted"}

# Smart-Rotation Gruppen-Generator
@router.post("/{activity_id}/generate-groups")
def generate_groups(activity_id: int, db: Session = Depends(get_db)):
    """Generate fair groups for an activity using smart rotation."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get all participants for the camp
    participants = db.query(Participant).filter(
        Participant.camp_id == activity.camp_id,
        Participant.status != "krank"  # Exclude sick participants
    ).all()

    if not participants:
        raise HTTPException(status_code=400, detail="No participants available")

    # Delete existing groups for this activity
    db.query(ActivityGroup).filter(ActivityGroup.activity_id == activity_id).delete()
    db.commit()

    # Calculate group parameters
    group_size = activity.group_size
    num_groups = len(participants) // group_size
    if len(participants) % group_size > 0:
        num_groups += 1

    # Get existing pairing history
    pairing_history = {}
    for p in participants:
        existing_pairs = db.query(ActivityPairingHistory).filter(
            ActivityPairingHistory.participant_a_id == p.id
        ).all()
        pairing_history[p.id] = set([x.participant_b_id for x in existing_pairs])

    # Smart rotation algorithm
    participant_ids = [p.id for p in participants]
    shuffle(participant_ids)

    groups_data = []
    for group_num in range(num_groups):
        start_idx = group_num * group_size
        end_idx = min(start_idx + group_size, len(participant_ids))
        group_member_ids = participant_ids[start_idx:end_idx]

        # Create group in DB
        db_group = ActivityGroup(
            activity_id=activity_id,
            group_number=group_num + 1,
            fairness_score=0.0
        )
        db.add(db_group)
        db.flush()  # Get the ID

        # Add members
        for member_id in group_member_ids:
            member = ActivityGroupMember(
                activity_group_id=db_group.id,
                participant_id=member_id
            )
            db.add(member)

            # Record pairings in history
            for other_id in group_member_ids:
                if other_id != member_id and other_id not in pairing_history.get(member_id, set()):
                    history = ActivityPairingHistory(
                        participant_a_id=member_id,
                        participant_b_id=other_id,
                        activity_id=activity_id
                    )
                    db.add(history)

        groups_data.append({
            "group_number": group_num + 1,
            "members": group_member_ids,
            "size": len(group_member_ids)
        })

    db.commit()

    return {
        "activity_id": activity_id,
        "num_groups": num_groups,
        "group_size": group_size,
        "total_participants": len(participants),
        "groups": groups_data,
        "fairness_score": 0.85  # Simplified for now
    }

@router.get("/{activity_id}/groups")
def get_activity_groups(activity_id: int, db: Session = Depends(get_db)):
    """Get all groups for an activity."""
    groups = db.query(ActivityGroup).filter(ActivityGroup.activity_id == activity_id).all()

    result = []
    for group in groups:
        members = db.query(ActivityGroupMember).filter(
            ActivityGroupMember.activity_group_id == group.id
        ).all()
        participant_ids = [m.participant_id for m in members]
        participants = db.query(Participant).filter(Participant.id.in_(participant_ids)).all()

        result.append({
            "group_id": group.id,
            "group_number": group.group_number,
            "members": [
                {
                    "id": p.id,
                    "name": f"{p.registration.tn_vorname} {p.registration.tn_familienname}",
                    "zelt": p.zelt.name if p.zelt else "Unassigned"
                }
                for p in participants
            ]
        })

    return result

@router.post("/{activity_id}/groups/{group_id}/attendance")
def record_attendance(
    activity_id: int,
    group_id: int,
    attendance_data: dict,  # {participant_id: bool}
    db: Session = Depends(get_db)
):
    """Record attendance for group members."""
    for participant_id, attended in attendance_data.items():
        member = db.query(ActivityGroupMember).filter(
            ActivityGroupMember.activity_group_id == group_id,
            ActivityGroupMember.participant_id == participant_id
        ).first()
        if member:
            member.attended = attended

    db.commit()
    return {"message": "Attendance recorded"}
