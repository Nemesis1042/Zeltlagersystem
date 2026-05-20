# BULA2026 - Zeltlager-Verwaltungssystem

Vollständiges Web-basiertes Verwaltungssystem für Jugend-Zeltlager mit 80 Teilnehmern und 16 Mitarbeitern.

## 🎯 Top 6 Features (MVP)

1. **Anmeldungs-Website** - Online Formular mit 5 Steps, Unterschriften, PDF-Export
2. **Check-In System** - Teilnehmer bei Anreise abhaken
3. **Taschengeld + QR-Scanner PWA** - Transaktionen mit Offline-Mode
4. **Teilnehmer-Übersicht** - Admin-Ansicht mit Gesundheit, Kontakte, Details
5. **Zeltplatz-Zuordnung** - Drag & Drop TN zu Zelten, Betreuer zuweisen
6. **Aktivitäten + Gruppen-Generator** - Smart-Rotation für faire Gruppeneinteilung

## 🛠️ Tech Stack

- **Backend**: Python 3.11 + FastAPI + PostgreSQL
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Auth**: JWT (python-jose)
- **Container**: Docker + Docker Compose

## 🚀 Quick Start

### Docker
```bash
docker-compose up -d
```

Startet:
- PostgreSQL auf Port 5432
- FastAPI Backend auf Port 8000

### Frontend (separates Terminal)
```bash
cd frontend
npm install
npm run dev
```

Frontend auf http://localhost:5173

## 📋 API Docs
- Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📊 Status

- [x] Backend-Setup mit FastAPI + PostgreSQL
- [x] Database-Schema (11 Models)
- [x] Authentication (JWT)
- [x] Alle Core API-Endpunkte
- [x] Frontend-Grundgerüst mit React
- [x] Anmeldungs-Formular (5 Steps)
- [x] Admin-Dashboard (UI Skeleton)
- [ ] Canvas-Signaturen
- [ ] Email-System
- [ ] QR-Scanner PWA
- [ ] Foto-Upload & Galerie
- [ ] PDF-Export

## 🔗 Branch

`claude/camp-management-system-qB0OM` - Development Branch für Claude Code