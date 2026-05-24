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

    // POST /api/products/
    if ($path === '/api/products/' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['name']) || !isset($input['price'])) {
            http_response_code(400);
            echo json_encode(['error' => 'name and price required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO products (name, price, icon) VALUES (?, ?, ?)");
        $stmt->execute([
            $input['name'],
            (float)$input['price'],
            $input['icon'] ?? null
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    // PATCH /api/products/{id}
    if (preg_match('/^\/api\/products\/(\d+)/', $path, $m) && $method === 'PATCH') {
        $product_id = (int)$m[1];
        $input = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare("SELECT id FROM products WHERE id = ?");
        $stmt->execute([$product_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            exit;
        }

        $updates = [];
        $params = [];
        if (isset($input['name'])) {
            $updates[] = "name = ?";
            $params[] = $input['name'];
        }
        if (isset($input['price'])) {
            $updates[] = "price = ?";
            $params[] = (float)$input['price'];
        }
        if (isset($input['icon'])) {
            $updates[] = "icon = ?";
            $params[] = $input['icon'];
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $params[] = $product_id;
        $stmt = $pdo->prepare("UPDATE products SET " . implode(", ", $updates) . " WHERE id = ?");
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode(['success' => true]);
        exit;
    }

    // DELETE /api/products/{id}
    if (preg_match('/^\/api\/products\/(\d+)/', $path, $m) && $method === 'DELETE') {
        $product_id = (int)$m[1];

        $stmt = $pdo->prepare("SELECT id FROM products WHERE id = ?");
        $stmt->execute([$product_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$product_id]);

        http_response_code(200);
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
?>
