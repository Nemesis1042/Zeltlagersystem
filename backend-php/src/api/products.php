<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/products/
    if ($path === '/api/products/' && $method === 'GET') {
        $stmt = $pdo->query("SELECT id, name, price, icon FROM products ORDER BY name");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // GET /api/products/{id}
    if (preg_match('/^\/api\/products\/(\d+)/', $path, $m) && $method === 'GET') {
        $product_id = (int)$m[1];
        $stmt = $pdo->prepare("SELECT id, name, price, icon FROM products WHERE id = ?");
        $stmt->execute([$product_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            exit;
        }
        echo json_encode($result);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
?>
