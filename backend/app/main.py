from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings
from app.core.database import engine, Base
from app.routes import auth, registrations, participants, tents, check_in, pocket_money, activities, photos

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Zeltlager-Verwaltungssystem Backend API",
    version="0.1.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(registrations.router, prefix="/api/registrations", tags=["registrations"])
app.include_router(participants.router, prefix="/api/participants", tags=["participants"])
app.include_router(tents.router, prefix="/api/tents", tags=["tents"])
app.include_router(check_in.router, prefix="/api/check-in", tags=["check-in"])
app.include_router(pocket_money.router, prefix="/api/pocket-money", tags=["pocket-money"])
app.include_router(activities.router, prefix="/api/activities", tags=["activities"])
app.include_router(photos.router, prefix="/api/photos", tags=["photos"])

# Serve static files (uploads)
upload_dir = Path("uploads")
upload_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {
        "message": "BULA2026 Zeltlager-Verwaltungssystem API",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
