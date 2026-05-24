<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'd0470938');
define('DB_PASS', 'Za5KgCOQf-Z1tMa1xova');
define('DB_NAME', 'd0470938');

// API Configuration
define('API_BASE_URL', 'https://lagerbank.info/api');
define('FRONTEND_URL', 'https://lagerbank.info');
define('JWT_SECRET', 'bula2026-super-geheimes-passwort-mindestens-32-zeichen');

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
