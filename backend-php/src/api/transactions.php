<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/transactions/
    if ($path === '/api/transactions/' && $method === 'GET') {
        $stmt = $pdo->query("SELECT id, user_id, total_amount, transaction_type, created_at FROM transactions ORDER BY created_at DESC LIMIT 100");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // GET /api/transactions/{id}
    if (preg_match('/^\/api\/transactions\/(\d+)/', $path, $m) && $method === 'GET') {
        $transaction_id = (int)$m[1];
        $stmt = $pdo->prepare("SELECT id, user_id, total_amount, transaction_type, created_at FROM transactions WHERE id = ?");
        $stmt->execute([$transaction_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Transaction not found']);
            exit;
        }
        echo json_encode($result);
        exit;
    }

    // POST /api/transactions/
    if ($path === '/api/transactions/' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['user_id']) || !isset($input['total_amount']) || !isset($input['transaction_type'])) {
            http_response_code(400);
            echo json_encode(['error' => 'user_id, total_amount, transaction_type required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO transactions (user_id, total_amount, transaction_type) VALUES (?, ?, ?)");
        $stmt->execute([
            (int)$input['user_id'],
            (float)$input['total_amount'],
            $input['transaction_type']
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
?>
