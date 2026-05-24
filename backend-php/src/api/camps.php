<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($method === 'GET' && preg_match('/^\/api\/camps\/$/', $path)) {
    echo json_encode([]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
