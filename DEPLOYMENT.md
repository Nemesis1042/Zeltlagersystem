# 🚀 DEPLOYMENT GUIDE - BULA2026 Zeltlagersystem

## 📋 Voraussetzungen
- All-Inkl Hosting mit FTP-Zugang
- KAS Control Panel Access
- MySQL Datenbank (leer)
- 2 Subdomains: `lagerbank.info` und `anmeldung.lagerbank.info`

---

## ✅ SCHRITT 1: Datenbank Setup (im KAS Control Panel)

### 1.1 Neue MySQL Datenbank erstellen
1. Login ins KAS Control Panel
2. Gehe zu: **Webhosting** → **MySQL Datenbanken**
3. Klick auf **Neue Datenbank hinzufügen**
4. Name: `bula2026_camp` (oder ähnlich)
5. Notiere: 
   - **Datenbankname**
   - **Benutzer** (z.B. `k123456_bula`)
   - **Passwort** (generieren)

### 1.2 SQL Schema importieren
1. Im KAS → **phpMyAdmin** öffnen
2. Datenbank `bula2026_camp` auswählen
3. Tab **Import**
4. Datei hochladen: `backend-php/schema.sql`
5. **Go** klicken

✅ Admin-Account wird automatisch erstellt:
- Email: `admin@lagerbank.info`
- Passwort: `admin123` (bitte nach dem Deploy ändern!)

---

## 📦 SCHRITT 2: Frontend bauen (lokal auf deinem Computer)

```bash
cd frontend

# Admin-App bauen (für lagerbank.info)
npm run build:admin

# Registration-App bauen (für anmeldung.lagerbank.info)
npm run build:registration
```

Das erzeugt zwei Ordner:
- `dist-admin/` → für lagerbank.info
- `dist-registration/` → für anmeldung.lagerbank.info

---

## 🔌 SCHRITT 3: Backend hochladen (FTP)

### 3.1 FTP verbinden
- Host: `ftp.all-inkl.com` (oder deine Domain)
- Benutzer: dein FTP-Username (aus KAS)
- Passwort: dein FTP-Passwort

### 3.2 Dateien hochladen
```
/                                   (Root Verzeichnis)
├── .htaccess                       ← von backend-php/
├── backend-php/                    ← ganzer Ordner
│   ├── public/
│   ├── src/
│   ├── config/
│   └── schema.sql
└── (später: Frontend Dateien)
```

### 3.3 Backend konfigurieren
**FTP:** Öffne `backend-php/config/config.php`

```php
<?php
// EDIT diese Werte:
define('DB_HOST', 'localhost');          // oder mysql-server
define('DB_USER', 'k123456_bula');       // ← DEIN DB-USER (aus Schritt 1)
define('DB_PASS', 'deinPasswort');       // ← DEIN DB-PASSWORT
define('DB_NAME', 'bula2026_camp');      // ← DEIN DB-NAME
define('API_BASE_URL', 'https://lagerbank.info/api');
define('FRONTEND_URL', 'https://lagerbank.info');
define('JWT_SECRET', 'change-this-to-random-secret-key-in-production');
?>
```

Speichern & hochladen.

---

## 🎨 SCHRITT 4: Admin Frontend hochladen (lagerbank.info)

### 4.1 Hauptdomain vorbereiten
Im KAS:
- **Webhosting** → **Domains**
- `lagerbank.info` → zeigt auf `/www/lagerbank.info/`

### 4.2 Dateien hochladen
FTP in `/www/lagerbank.info/`:

```
lagerbank.info/
├── .htaccess              ← von dist-admin/.htaccess
├── index.html             ← von dist-admin/index.html
├── assets/                ← von dist-admin/assets/
├── backend-php/           ← Backend (aus Schritt 3)
└── uploads/               ← (wird automatisch erstellt)
```

**Wichtig:** `.htaccess` muss in Root sein!

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # API Requests → backend
  RewriteRule ^api/(.*)$ backend-php/public/index.php?path=$1 [QSA,L]
  
  # Alles andere → index.html (React Router)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

---

## 📝 SCHRITT 5: Registration Frontend hochladen (anmeldung.lagerbank.info)

### 5.1 Subdomain erstellen
Im KAS:
- **Webhosting** → **Subdomains**
- Neue Subdomain: `anmeldung` für Domain `lagerbank.info`
- Zeigt auf: `/www/anmeldung.lagerbank.info/`

### 5.2 Dateien hochladen
FTP in `/www/anmeldung.lagerbank.info/`:

```
anmeldung.lagerbank.info/
├── .htaccess         ← (gleich wie Admin)
├── index.html        ← von dist-registration/index.html
└── assets/           ← von dist-registration/assets/
```

---

## 🧪 SCHRITT 6: Testing

### 6.1 Admin-App testen
1. Öffne: https://lagerbank.info
2. Login: 
   - Email: `admin@lagerbank.info`
   - Passwort: `admin123`
3. Durchklicke alle Menüpunkte:
   - Overview ✓
   - Camps ✓
   - Participants ✓
   - Check-In ✓
   - etc.

### 6.2 Registration-App testen
1. Öffne: https://anmeldung.lagerbank.info
2. Fülle Registrierungsformular aus
3. Check ob es in der Datenbank ankommt

### 6.3 API testen
```bash
# Login testen
curl -X POST https://lagerbank.info/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lagerbank.info","password":"admin123"}'

# Sollte JWT Token zurückgeben
```

---

## 🔒 SCHRITT 7: Sicherheit & Finalisierung

### 7.1 Admin-Passwort ändern
Nach dem Deploy sofort:
1. Login mit `admin@lagerbank.info` / `admin123`
2. Gehe zu: **Administration** → **Benutzer**
3. Ändere Passwort auf etwas Sicheres

### 7.2 JWT Secret ändern
`backend-php/config/config.php`:
```php
define('JWT_SECRET', 'super-geheimes-zufälliges-passwort-mindestens-32-zeichen');
```

### 7.3 Permissions setzen
```bash
# FTP - diese Dateien sind wichtig:
chmod 755 backend-php/public/
chmod 755 backend-php/public/uploads/
chmod 644 backend-php/config/config.php
```

---

## 📊 Dateistruktur nach Deploy

```
lagerbank.info/
├── .htaccess
├── index.html               (Admin App)
├── assets/js/main-xxx.js    (React Bundle)
├── assets/css/style-xxx.css (Tailwind)
├── backend-php/
│   ├── public/index.php     (API Entry Point)
│   ├── src/repositories/
│   ├── src/services/
│   ├── config/config.php    (DB Credentials)
│   └── schema.sql
└── uploads/
    └── photos/              (User Uploads)

anmeldung.lagerbank.info/
├── .htaccess
├── index.html               (Registration App)
└── assets/                  (React Bundle)
```

---

## 🆘 Troubleshooting

### Problem: "API not found" / 404 Fehler
- ✅ `.htaccess` in Root?
- ✅ `mod_rewrite` aktiviert? (im KAS prüfen)
- ✅ `backend-php/config/config.php` korrekt?

### Problem: "Database connection failed"
- ✅ DB-Name, User, Passwort korrekt? (aus Schritt 1)
- ✅ Schema importiert? (schema.sql)
- ✅ `localhost` vs. MySQL Server Name prüfen

### Problem: "Blank Page"
- ✅ Browser Cache löschen
- ✅ `index.html` vorhanden?
- ✅ assets/ Ordner uploaded?

---

## ✨ Fertig!

Nach diesen Schritten sollte das System live sein:
- **Admin Dashboard:** https://lagerbank.info
- **Registration:** https://anmeldung.lagerbank.info
- **API:** https://lagerbank.info/api/

🎉 **BULA2026 Zeltlagersystem ist produktiv!**

---

## 📞 Nächste Schritte (Optional)

1. **SSL Zertifikat:** Sollte All-Inkl automatisch machen (Let's Encrypt)
2. **Email-System:** Backend kann E-Mail versenden (wenn konfiguriert)
3. **Backups:** Regelmäßig MySQL dumpen
4. **Monitoring:** Logs checken: `backend-php/logs/` (wenn vorhanden)

