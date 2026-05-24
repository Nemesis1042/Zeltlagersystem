<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($method === 'GET' && preg_match('/^\/api\/transactions\/$/', $path)) {
    $camp_id = $_GET['camp_id'] ?? 1;
    echo json_encode([]);
    exit;
}

if ($method === 'GET' && preg_match('/^\/api\/transactions\/(\d+)\/$/', $path, $m)) {
    echo json_encode(['id' => $m[1], 'amount' => 0, 'description' => '']);
    exit;
}

if ($method === 'POST' && preg_match('/^\/api\/transactions\/$/', $path)) {
    echo json_encode(['id' => 1, 'success' => true]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
