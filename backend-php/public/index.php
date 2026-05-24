<?php

require_once __DIR__ . '/../config/config.php';

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

// Route /api/photos/*
if (preg_match('/^\/api\/photos/', $request_uri)) {
    require __DIR__ . '/../src/api/photos.php';
    exit;
}

// Health check
if ($request_uri === '/api/health' && $request_method === 'GET') {
    echo json_encode(['status' => 'ok']);
    exit;
}

// Default 404
http_response_code(404);
echo json_encode(['error' => 'API endpoint not found']);
