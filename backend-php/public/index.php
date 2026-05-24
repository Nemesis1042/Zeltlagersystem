<?php
/**
 * BULA2026 - API Entry Point
 * All requests go through here
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Configuration
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../src/Router.php';

// Load repositories
require_once __DIR__ . '/../src/repositories/UserRepository.php';
require_once __DIR__ . '/../src/repositories/ParticipantRepository.php';
require_once __DIR__ . '/../src/repositories/TentRepository.php';
require_once __DIR__ . '/../src/repositories/ActivityRepository.php';
require_once __DIR__ . '/../src/repositories/RegistrationRepository.php';
require_once __DIR__ . '/../src/repositories/PhotoRepository.php';
require_once __DIR__ . '/../src/repositories/PocketMoneyRepository.php';

// Load services
require_once __DIR__ . '/../src/services/AuthService.php';

// Initialize Router
$router = new Router();

// Health Check
$router->get('/health', function() {
    http_response_code(200);
    echo json_encode([
        'status' => 'ok',
        'version' => '1.0.0',
        'timestamp' => date('c')
    ]);
});

// Root Info
$router->get('/', function() {
    http_response_code(200);
    echo json_encode([
        'message' => 'BULA2026 Zeltlager-Verwaltungssystem API',
        'version' => '1.0.0',
        'status' => 'ready'
    ]);
});

// Authentication Routes
require __DIR__ . '/../src/api/auth.php';

// Users Routes
require __DIR__ . '/../src/api/users.php';

// Participants Routes
require __DIR__ . '/../src/api/participants.php';

// Registrations Routes
require __DIR__ . '/../src/api/registrations.php';

// Check-In Routes
require __DIR__ . '/../src/api/check-in.php';

// Tents Routes
require __DIR__ . '/../src/api/tents.php';

// Activities Routes
require __DIR__ . '/../src/api/activities.php';

// Photos Routes
require __DIR__ . '/../src/api/photos.php';

// Pocket Money Routes
require __DIR__ . '/../src/api/pocket-money.php';

// Dispatch Request
$router->dispatch();
