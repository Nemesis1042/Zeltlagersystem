<?php
/**
 * BULA2026 - Zeltlager-Verwaltungssystem
 * Konfiguration für All-Inkl Hosting
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'bula2026_db');  // Ersetze mit deinem All-Inkl DB-Benutzer
define('DB_PASS', '');              // Ersetze mit Passwort
define('DB_NAME', 'bula2026');      // Ersetze mit deinem DB-Namen

// App Configuration
define('APP_NAME', 'BULA2026');
define('APP_VERSION', '2.0.0');
define('APP_ENV', 'production');    // development | production

// Paths
define('BASE_PATH', dirname(__DIR__));
define('PUBLIC_PATH', BASE_PATH . '/public');
define('UPLOAD_PATH', BASE_PATH . '/uploads');

// JWT/Authentication
define('JWT_SECRET', ''); // Generiere einen sicheren Key
define('JWT_EXPIRY', 86400 * 7); // 7 Tage

// Email Configuration
define('MAIL_FROM', 'noreply@lagerbank.info');
define('MAIL_HOST', 'mail.all-inkl.com');
define('MAIL_PORT', 587);
define('MAIL_USER', '');
define('MAIL_PASS', '');

// Cors
define('ALLOWED_ORIGINS', array(
    'http://localhost:5173',
    'http://localhost:3000',
    'https://lagerbank.info',
    'https://admin.lagerbank.info',
    'https://anmeldung.lagerbank.info'
));

// Error Handling
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Timezone
date_default_timezone_set('Europe/Zurich');
