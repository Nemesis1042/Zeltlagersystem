# 🏕️ BULA2026 Zeltlagersystem

**Vollständiges Camp-Management-System mit Admin-, Staff- und Eltern-Dashboards**

---

## 📊 System Overview

### ✅ Features Implementiert

#### 🔐 Admin Dashboard (lagerbank.info)
- **11 Seiten** für komplette Camp-Verwaltung
  - Overview: Statistiken & Quick Actions
  - Camps: CRUD-Operationen für Lager
  - Participants: Teilnehmer-Management mit Suche & Filter
  - Check-In: Ankunftsverwaltung mit Live-Progress
  - Tents: Zeltplatz-Management & Zuordnung
  - Activities: Aktivitäten mit Auto-Gruppen-Generator
  - Photos: Foto-Galerie mit Release-Control
  - Finances: Transaktionsmanagement & Statistiken
  - Reports: Report-Generierung (CSV, PDF)
  - Administration: System-Settings & Verwaltung
  - Permissions: Rollen & Berechtigungen

#### 👨‍💼 Staff/MA Dashboard (lagerbank.info/staff)
- **5 Seiten** für Betreuer
  - Overview: Quick Stats & Check-In Progress
  - Participants: Teilnehmerliste mit Allergien
  - Check-In: Check-In Management
  - Activities: Aktivitäten & Gruppen
  - Pocket Money: Taschengeld-Verwaltung

#### 👨‍👩‍👧 Eltern Dashboard (lagerbank.info/eltern)
- **5 Seiten** für Eltern (Read-only)
  - Overview: Willkommensseite
  - Child: Kinddaten & Gesundheitsinformationen
  - Photos: Foto-Galerie (nur freigegebene)
  - Activities: Verfügbare Aktivitäten
  - Contact: Kontaktformular & FAQ

#### 📝 Registration (anmeldung.lagerbank.info)
- Mehrstufiges Registrierungsformular
- Teilnehmer- & Erziehungsberechtigten-Daten
- Gesundheitsinformationen & Allergien
- Digitale Signaturen
- PLZ Auto-Fill für Adressen

---

## 🚀 Schnelles Deployment zu IONOS

```bash
# 1. Apps bauen
npm run build:admin
npm run build:registration

# 2. Deploy Script ausführen
./deploy-ionos.sh

# Eingaben:
# - SSH Alias (wie du ihn konfiguriert hast)
# - IONOS Web-Root Code (z.B. w01e9b9c)
# - Was deployen? (1=Admin+Backend, 2=Registration, 3=Beides)
```

---

## 📋 Nach dem Deployment

### 1. Datenbank erstellen (IONOS KAS)
- Neue MySQL Datenbank anlegen
- Credentials notieren
- `schema.sql` importieren

### 2. Backend konfigurieren
Bearbeite via SSH oder SFTP: `backend-php/config/config.php`
```php
define('DB_USER', 'k123456_bula');    // ← DEIN DB-User
define('DB_PASS', 'deinPasswort');    // ← DEIN Passwort
define('DB_NAME', 'bula2026_camp');   // ← DEIN DB-Name
```

### 3. Testen
```
https://lagerbank.info
Login: admin@lagerbank.info / admin123 (ÄNDERN!)

https://anmeldung.lagerbank.info
```

---

## 🏗️ Technologie

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | PHP 8.1 + MySQL 8.0 |
| Auth | JWT + Bcrypt |
| API | 30+ REST Endpoints |
| Database | 13 normalisierte Tabellen |
| Hosting | IONOS SSH/SCP Deployment |

---

## 📁 Wichtige Dateien

```
frontend/
  ├── dist-admin/          → Admin App (fertig gebaut)
  ├── dist-registration/   → Registration App (fertig gebaut)
  └── src/
      ├── pages/           (21 Pages für 3 Dashboards)
      └── components/      (Admin/Staff/Eltern Layout)

backend-php/
  ├── config/config.php    → Datenbank-Konfiguration (EDITIEREN!)
  ├── src/api/            (API Endpoints)
  ├── src/repositories/   (Datenbank-Zugriff)
  └── schema.sql          (DB Structure)

deploy-ionos.sh           → Deployment Automation
DEPLOYMENT.md             → Detaillierte Anleitung
```

---

## 🔑 Standard Credentials

Nach `schema.sql` Import:
- **Email:** admin@lagerbank.info
- **Passwort:** admin123
- **⚠️ WICHTIG:** Nach erstem Login ändern!

---

## ✨ Was wurde implementiert

✅ 21 Frontend Pages (3 Dashboards × 7 Pages)
✅ 30+ REST API Endpoints
✅ Role-Based Access Control (Admin/Staff/Eltern)
✅ Responsive Design (Mobile/Tablet/Desktop)
✅ JWT Authentication + Bcrypt
✅ Photo Release Management
✅ Activity Group Generator
✅ Transaction Management
✅ Report Generation (CSV)
✅ IONOS SSH Deployment Script
✅ Vollständige Datenbank Schema

---

## 🆘 Troubleshooting

**"API nicht gefunden" / 404 Fehler**
- Prüfe: `.htaccess` in Root vorhanden?
- Prüfe: mod_rewrite aktiviert in IONOS?
- Prüfe: `config.php` mit richtigen DB-Daten gefüllt?

**"Datenbank-Verbindung fehlgeschlagen"**
- Prüfe: DB-User, Passwort, Name korrekt?
- Prüfe: schema.sql importiert?

**"SSH-Verbindung fehlgeschlagen"**
- Prüfe: SSH Alias korrekt?
- Prüfe: Web-Root Code korrekt?

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
