<?php

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/Database.php';

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

// API Routes
$routes = [
    'photos' => __DIR__ . '/../src/api/photos.php',
    'transactions' => __DIR__ . '/../src/api/transactions.php',
    'participants' => __DIR__ . '/../src/api/participants.php',
    'activities' => __DIR__ . '/../src/api/activities.php',
    'tents' => __DIR__ . '/../src/api/tents.php',
    'camps' => __DIR__ . '/../src/api/camps.php',
    'products' => __DIR__ . '/../src/api/products.php',
    'pocket-money' => __DIR__ . '/../src/api/pocket-money.php',
    'users' => __DIR__ . '/../src/api/users.php',
    'check-in' => __DIR__ . '/../src/api/check-in.php',
    'auth' => __DIR__ . '/../src/api/auth.php',
];

// Health check
if ($request_uri === '/api/health' && $request_method === 'GET') {
    echo json_encode(['status' => 'ok']);
    exit;
}

// Route to handler
foreach ($routes as $route => $file) {
    if (preg_match('/^\/api\/' . $route . '/', $request_uri)) {
        if (file_exists($file)) {
            require $file;
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'API handler not found']);
        }
        exit;
    }
}

// 404
http_response_code(404);
echo json_encode(['error' => 'API endpoint not found']);
