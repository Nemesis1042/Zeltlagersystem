<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// GET /api/products/
if ($method === 'GET' && preg_match('/^\/api\/products\/$/', $path)) {
    $stmt = $db->execute('SELECT id, name, price, category FROM products WHERE active = 1 ORDER BY category');
    echo json_encode($stmt->fetchAll() ?: []);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
