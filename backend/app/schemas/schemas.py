from pydantic import BaseModel, EmailStr
from datetime import date, time, datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    vorname: str
    nachname: str
    telefon: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    role: str
    active: bool

    class Config:
        from_attributes = True

# Registration Schemas
class RegistrationCreate(BaseModel):
    # Teilnehmer
    tn_familienname: str
    tn_vorname: str
    tn_strasse: Optional[str] = None
    tn_plz: Optional[str] = None
    tn_ort: Optional[str] = None
    tn_geburtsdatum: date
    tn_geschlecht: str
    tn_telefon: Optional[str] = None
    tn_email: Optional[str] = None
    tn_konfession: Optional[str] = None

    # Sorgeberechtigte
    sorge_anrede: str
    sorge_familienname: str
    sorge_vorname: str
    sorge_strasse: str
    sorge_plz: str
    sorge_ort: str
    sorge_telefon_festnetz: Optional[str] = None
    sorge_telefon_mobil: str
    sorge_email: EmailStr
    sorge_beruf: Optional[str] = None

    # Notfallkontakt
    notfall_name: str
    notfall_telefon: str
    notfall_beziehung: str

    # Krankenversicherung
    krankenkasse: str
    versicherten_nr: Optional[str] = None
    kk_karte_mitgebracht: bool = False
    hausarztmodell: bool = False
    hausarzt: Optional[str] = None

    # Gesundheit
    allergien: Optional[str] = None
    vegetarier: bool = False
    vegan: bool = False
    kein_schweinefleisch: bool = False
    medikamente: Optional[str] = None
    erkrankungen: Optional[str] = None
    besonderheiten: Optional[str] = None

    # Schwimmen
    schwimmer: bool = False
    schwimm_erlaubnis: bool = False

    # Einwilligungen
    foto_einwilligung: bool = False
    rki_gelesen: bool = False
    gesundheit_bestaetigung: bool = False
    medikamente_gabe_erlaubnis: bool = False

    # Unterschriften (base64 oder binary)
    sig_sorge: Optional[str] = None
    sig_tn: Optional[str] = None

class Registration(RegistrationCreate):
    id: int
    camp_id: int
    status: str
    gebuehr_bezahlt: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Participant Schemas
class ParticipantBase(BaseModel):
    zelt_id: Optional[int] = None
    status: str = "gesund"

class ParticipantCreate(ParticipantBase):
    registration_id: int

class Participant(ParticipantBase):
    id: int
    camp_id: int
    registration_id: int
    foto_url: Optional[str] = None
    check_in_time: Optional[datetime] = None

    class Config:
        from_attributes = True

# Tent Schemas
class TentCreate(BaseModel):
    name: str
    capacity: int = 8
    color: Optional[str] = None
    icon: Optional[str] = None

class Tent(TentCreate):
    id: int
    camp_id: int
    position_x: Optional[float] = None
    position_y: Optional[float] = None

    class Config:
        from_attributes = True

# Activity Schemas
class ActivityCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    date: date
    time_start: time
    time_end: time
    location: Optional[str] = None
    max_participants: int = 80
    group_size: int = 10
    material: Optional[str] = None

class Activity(ActivityCreate):
    id: int
    camp_id: int
    fairness_score: Optional[float] = None

    class Config:
        from_attributes = True

# Pocket Money Schemas
class PocketMoneyAccountCreate(BaseModel):
    participant_id: int
    initial_balance: float = 0.0

class PocketMoneyAccount(PocketMoneyAccountCreate):
    id: int
    current_balance: float

    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    participant_id: int
    product_name: Optional[str] = None
    amount: float
    description: Optional[str] = None

class Transaction(TransactionCreate):
    id: int
    account_id: int
    ma_user_id: Optional[int] = None
    synced: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Check-In Schemas
class CheckInRequest(BaseModel):
    participant_id: int
    brought_by: Optional[str] = None

class CheckInResponse(BaseModel):
    participant_id: int
    check_in_time: datetime
    checked_in_by: str

# Auth Response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User
