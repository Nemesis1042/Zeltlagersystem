<?php
/**
 * BULA2026 - API Entry Point
 * All requests go through here
 */

// Configuration
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../src/Router.php';

// Initialize Router
$router = new Router();

// Auth Routes
$router->post('/api/auth/login', function($params) {
    require __DIR__ . '/../src/api/auth.php';
    $auth = new AuthAPI();
    $auth->login();
});

$router->post('/api/auth/register', function($params) {
    require __DIR__ . '/../src/api/auth.php';
    $auth = new AuthAPI();
    $auth->register();
});

$router->get('/api/auth/me', function($params) {
    require __DIR__ . '/../src/api/auth.php';
    $auth = new AuthAPI();
    $auth->me();
});

// Health Check
$router->get('/api/health', function($params) {
    http_response_code(200);
    echo json_encode(array(
        'status' => 'ok',
        'version' => APP_VERSION,
        'timestamp' => date('c')
    ));
});

// Root Info
$router->get('/', function($params) {
    http_response_code(200);
    echo json_encode(array(
        'message' => 'BULA2026 Zeltlager-Verwaltungssystem API',
        'version' => APP_VERSION,
        'docs' => '/api/docs',
        'endpoints' => array(
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /api/auth/me'
        )
    ));
});

// Dispatch Request
$router->dispatch();
