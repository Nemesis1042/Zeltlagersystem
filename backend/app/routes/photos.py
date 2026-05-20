from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Photo, User
from datetime import datetime
import os
import secrets
from pathlib import Path

router = APIRouter()

UPLOAD_DIR = Path("uploads/photos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def get_current_user(token: str = None) -> User:
    """Simplified user extraction from token (would need JWT verification in production)"""
    return None

@router.post("/")
async def upload_photo(
    file: UploadFile = File(...),
    camp_id: int = 1,
    description: str = "Lager-Foto",
    db: Session = Depends(get_db)
):
    """Upload a photo to the gallery."""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    filename = f"{secrets.token_hex(8)}_{file.filename}"
    filepath = UPLOAD_DIR / filename

    try:
        contents = await file.read()
        with open(filepath, 'wb') as f:
            f.write(contents)

        db_photo = Photo(
            camp_id=camp_id,
            user_id=1,
            filename=filename,
            description=description,
            released=False
        )
        db.add(db_photo)
        db.commit()
        db.refresh(db_photo)

        return {
            "id": db_photo.id,
            "url": f"/uploads/photos/{filename}",
            "description": db_photo.description,
            "released": db_photo.released,
            "created_at": db_photo.created_at
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_photos(camp_id: int, released: bool = None, db: Session = Depends(get_db)):
    """Get photos for a camp, optionally filtered by release status."""
    query = db.query(Photo).filter(Photo.camp_id == camp_id)

    if released is not None:
        query = query.filter(Photo.released == released)

    photos = query.order_by(Photo.created_at.desc()).all()

    return [
        {
            "id": p.id,
            "url": f"/uploads/photos/{p.filename}",
            "description": p.description,
            "released": p.released,
            "created_at": p.created_at
        }
        for p in photos
    ]

@router.patch("/{photo_id}")
def update_photo(
    photo_id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    """Update photo (e.g., release/unreleash)."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    if 'released' in data:
        photo.released = data['released']

    if 'description' in data:
        photo.description = data['description']

    db.commit()
    db.refresh(photo)

    return {
        "id": photo.id,
        "url": f"/uploads/photos/{photo.filename}",
        "description": photo.description,
        "released": photo.released,
        "created_at": photo.created_at
    }

@router.delete("/{photo_id}")
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    """Delete a photo."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    try:
        filepath = UPLOAD_DIR / photo.filename
        if filepath.exists():
            os.remove(filepath)
    except Exception as e:
        print(f"Error deleting file: {e}")

    db.delete(photo)
    db.commit()

    return {"message": "Photo deleted"}
