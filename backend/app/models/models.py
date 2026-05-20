from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, Date, Time, Enum, LargeBinary
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class User(Base):
    """User model for authentication (Admin, MA, Eltern)"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="eltern")  # admin, ma, eltern
    vorname = Column(String, nullable=True)
    nachname = Column(String, nullable=True)
    telefon = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    registrations = relationship("Registration", back_populates="user")
    participants = relationship("Participant", back_populates="user")

class Camp(Base):
    """Zeltlager"""
    __tablename__ = "camps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    date_start = Column(Date)
    date_end = Column(Date)
    location = Column(String)
    theme = Column(String, nullable=True)
    max_participants = Column(Integer, default=80)
    gebuehr_betrag = Column(Float, default=250.0)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    registrations = relationship("Registration", back_populates="camp")
    participants = relationship("Participant", back_populates="camp")
    tents = relationship("Tent", back_populates="camp")
    activities = relationship("Activity", back_populates="camp")

class Registration(Base):
    """Anmeldung"""
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    camp_id = Column(Integer, ForeignKey("camps.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="angemeldet")  # angemeldet, bestätigt, warteliste, abgelehnt

    # Teilnehmer
    tn_familienname = Column(String)
    tn_vorname = Column(String)
    tn_strasse = Column(String, nullable=True)
    tn_plz = Column(String, nullable=True)
    tn_ort = Column(String, nullable=True)
    tn_geburtsdatum = Column(Date)
    tn_geschlecht = Column(String)  # männlich, weiblich, divers
    tn_telefon = Column(String, nullable=True)
    tn_email = Column(String, nullable=True)
    tn_konfession = Column(String, nullable=True)

    # Sorgeberechtigte
    sorge_anrede = Column(String)
    sorge_familienname = Column(String)
    sorge_vorname = Column(String)
    sorge_strasse = Column(String)
    sorge_plz = Column(String)
    sorge_ort = Column(String)
    sorge_telefon_festnetz = Column(String, nullable=True)
    sorge_telefon_mobil = Column(String)
    sorge_email = Column(String)
    sorge_beruf = Column(String, nullable=True)

    # Notfallkontakt
    notfall_name = Column(String)
    notfall_telefon = Column(String)
    notfall_beziehung = Column(String)

    # Krankenversicherung
    krankenkasse = Column(String)
    versicherten_nr = Column(String, nullable=True)
    kk_karte_mitgebracht = Column(Boolean, default=False)
    hausarztmodell = Column(Boolean, default=False)
    hausarzt = Column(Text, nullable=True)

    # Gesundheit
    allergien = Column(Text, nullable=True)
    vegetarier = Column(Boolean, default=False)
    vegan = Column(Boolean, default=False)
    kein_schweinefleisch = Column(Boolean, default=False)
    medikamente = Column(Text, nullable=True)
    erkrankungen = Column(Text, nullable=True)
    besonderheiten = Column(Text, nullable=True)

    # Schwimmen
    schwimmer = Column(Boolean, default=False)
    schwimm_erlaubnis = Column(Boolean, default=False)

    # Einwilligungen
    foto_einwilligung = Column(Boolean, default=False)
    rki_gelesen = Column(Boolean, default=False)
    gesundheit_bestaetigung = Column(Boolean, default=False)
    medikamente_gabe_erlaubnis = Column(Boolean, default=False)

    # Unterschriften
    sig_sorge = Column(LargeBinary, nullable=True)  # Canvas data als Binary
    sig_tn = Column(LargeBinary, nullable=True)

    # Admin
    gebuehr_bezahlt = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    camp = relationship("Camp", back_populates="registrations")
    user = relationship("User", back_populates="registrations")

class Participant(Base):
    """Teilnehmer (verlinkt mit Registration)"""
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    camp_id = Column(Integer, ForeignKey("camps.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    registration_id = Column(Integer, ForeignKey("registrations.id"))

    foto_url = Column(String, nullable=True)
    zelt_id = Column(Integer, ForeignKey("tents.id"), nullable=True)
    status = Column(String, default="gesund")  # angekommen, krank, gesund

    check_in_time = Column(DateTime, nullable=True)
    checked_in_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    camp = relationship("Camp", back_populates="participants")
    user = relationship("User", back_populates="participants")
    zelt = relationship("Tent", back_populates="participants")
    pocket_money = relationship("PocketMoneyAccount", back_populates="participant", uselist=False)
    activities = relationship("ActivityGroupMember", back_populates="participant")

class Tent(Base):
    """Zelt"""
    __tablename__ = "tents"

    id = Column(Integer, primary_key=True, index=True)
    camp_id = Column(Integer, ForeignKey("camps.id"))
    name = Column(String)
    capacity = Column(Integer, default=8)
    color = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    position_x = Column(Float, nullable=True)
    position_y = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    camp = relationship("Camp", back_populates="tents")
    participants = relationship("Participant", back_populates="zelt")
    supervisors = relationship("User", secondary="tent_supervisors")

class Activity(Base):
    """Aktivität"""
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    camp_id = Column(Integer, ForeignKey("camps.id"))
    name = Column(String)
    description = Column(Text, nullable=True)
    category = Column(String)  # hobbygruppe, sport, kreativ, geländespiel, sonstiges
    date = Column(Date)
    time_start = Column(Time)
    time_end = Column(Time)
    location = Column(String, nullable=True)
    max_participants = Column(Integer, default=80)
    group_size = Column(Integer, default=10)
    material = Column(Text, nullable=True)
    fairness_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    camp = relationship("Camp", back_populates="activities")
    groups = relationship("ActivityGroup", back_populates="activity")

class ActivityGroup(Base):
    """Generierte Gruppe für Aktivität"""
    __tablename__ = "activity_groups"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"))
    group_number = Column(Integer)
    betreuer_id = Column(Integer, nullable=True)
    fairness_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    activity = relationship("Activity", back_populates="groups")
    members = relationship("ActivityGroupMember", back_populates="group")

class ActivityGroupMember(Base):
    """Mitglied in ActivityGroup"""
    __tablename__ = "activity_group_members"

    id = Column(Integer, primary_key=True, index=True)
    activity_group_id = Column(Integer, ForeignKey("activity_groups.id"))
    participant_id = Column(Integer, ForeignKey("participants.id"))
    attended = Column(Boolean, nullable=True)
    notizen = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("ActivityGroup", back_populates="members")
    participant = relationship("Participant", back_populates="activities")

class PocketMoneyAccount(Base):
    """Taschengeld-Konto"""
    __tablename__ = "pocket_money_accounts"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id"), unique=True)
    initial_balance = Column(Float, default=0.0)
    current_balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    participant = relationship("Participant", back_populates="pocket_money")
    transactions = relationship("Transaction", back_populates="account")

class Transaction(Base):
    """Transaktion (Taschengeld)"""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id"))
    account_id = Column(Integer, ForeignKey("pocket_money_accounts.id"))
    product_name = Column(String, nullable=True)
    amount = Column(Float)
    description = Column(String, nullable=True)
    ma_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    synced = Column(Boolean, default=True)  # Für Offline-Mode
    created_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("PocketMoneyAccount", back_populates="transactions")

class ActivityPairingHistory(Base):
    """Verlauf: Wer war mit wem zusammen"""
    __tablename__ = "activity_pairing_history"

    id = Column(Integer, primary_key=True, index=True)
    participant_a_id = Column(Integer, ForeignKey("participants.id"))
    participant_b_id = Column(Integer, ForeignKey("participants.id"))
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
