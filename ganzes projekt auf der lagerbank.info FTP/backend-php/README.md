# BULA2026 PHP Backend - All-Inkl Installation

## 📋 Anforderungen

- PHP 8.1+ (All-Inkl bietet 8.1-8.5)
- MySQL/MariaDB 10.0+
- SSH-Zugriff (optional, für Deployment)
- FTP-Zugriff

## 🚀 Installation auf All-Inkl

### 1. Datenbank erstellen

1. Öffne All-Inkl KAS → Datenbanken
2. Erstelle neue MySQL-Datenbank
3. Merke dir: **DB-Name, Benutzer, Passwort**

### 2. PHP-Dateien hochladen

```bash
# FTP via FileZilla/Cyberduck
# Local: /backend-php/
# Remote: /html/api/ (oder deine Domain)
```

### 3. Konfiguration anpassen

**Datei: `config/config.php`**

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'dein_db_benutzer');    // Aus KAS
define('DB_PASS', 'dein_db_passwort');    // Aus KAS
define('DB_NAME', 'dein_db_name');        // Aus KAS
```

**Für Mails:**
```php
define('MAIL_USER', 'deine_email@lagerbank.info');
define('MAIL_PASS', 'dein_passwort');
```

### 4. Database Schema importieren

Option A: phpMyAdmin (All-Inkl KAS)
1. Öffne phpMyAdmin
2. Importiere `schema.sql`

Option B: SSH
```bash
mysql -u dein_db_benutzer -p dein_db_name < schema.sql
```

### 5. Standard Admin-Passwort ändern

**WICHTIG:** Der Hash in `schema.sql` ist ein Test-Hash!

Generiere einen neuen:
```php
<?php
$password = 'dein_sicheres_passwort';
$hash = password_hash($password, PASSWORD_BCRYPT);
echo $hash;
?>
```

Dann aktualisiere die Datenbank:
```sql
UPDATE users SET password_hash = 'neuer_hash' WHERE email = 'admin@lagerbank.info';
```

### 6. URL-Rewriting aktivieren

`.htaccess` ist bereits im `public/`-Verzeichnis.

Falls nicht funktioniert, checke:
- All-Inkl KAS → Webaukasten → mod_rewrite aktiviert?
- RewriteBase ist auf `/` gesetzt

### 7. Testen

```bash
curl https://deine-domain.de/api/health

# Erwartet:
# {"status":"ok","version":"2.0.0","timestamp":"..."}
```

## 📁 Verzeichnisstruktur

```
backend-php/
├── config/
│   ├── config.php          # Konfiguration (DB, Mail, JWT)
│   └── Database.php        # PDO Connection Manager
├── src/
│   ├── repositories/       # DB Access (User, Participant, etc)
│   ├── services/          # Business Logic (Auth, Participant, etc)
│   ├── middleware/        # Auth, Logging, Validation
│   └── api/               # API Endpoints
├── public/
│   ├── index.php          # Entry Point
│   └── .htaccess          # URL Rewriting
├── uploads/               # Photos, Signatures
├── schema.sql             # MySQL Schema
└── README.md
```

## 🔐 Security

- ✅ Passwörter mit bcrypt gehasht
- ✅ JWT für API-Authentifizierung
- ✅ Prepared Statements gegen SQL-Injection
- ✅ CORS für Frontend-Integration
- ✅ Sensitive Dateien vor Zugriff geschützt (.htaccess)

## 📞 Troubleshooting

**Problem: "Fatal error: Call to undefined function"**
- PHP-Version zu alt?
- Fehlende Extension (PDO)?
- Check: All-Inkl KAS → PHP-Version & Extensions

**Problem: "Datenbankverbindung fehlgeschlagen"**
- DB-Credentials falsch?
- Datenbank existiert nicht?
- Benutzer hat keine Rechte?
- Check: All-Inkl KAS → Datenbanken

**Problem: 404 bei API-Calls**
- mod_rewrite nicht aktiviert?
- RewriteBase falsch?
- Prüfe .htaccess in public/

## 📚 API Endpoints (bisher)

```
POST   /api/auth/login      - Login (email, password)
POST   /api/auth/register   - Register (email, password, vorname, nachname)
GET    /api/auth/me         - Get current user (requires token)
GET    /api/health          - Health check
GET    /                     - API Info
```

## 🚧 Zu implementieren

- Participants API
- Tents API
- Activities + Group Generator
- Check-In API
- Pocket Money API
- Photo Gallery API
- PDF/Signatur-Export

## 💡 Entwicklung lokal

```bash
# Lokal testen mit PHP Built-in Server
php -S localhost:8000 -t public/

# Oder mit Docker:
docker run -p 8000:80 -v $(pwd):/var/www/html php:8.1-apache
```

## 📞 Support

All-Inkl Support: support@all-inkl.com oder Telefon +49 35872-35330
