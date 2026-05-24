<?php
header('Content-Type: application/json');

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // GET /api/transactions/
    if ($request_uri === '/api/transactions/' && $method === 'GET') {
        $camp_id = $_GET['camp_id'] ?? 1;
        $query = "SELECT t.id, t.user_id, t.total_amount, t.transaction_type, t.created_at FROM transactions t
                  WHERE 1=1
                  ORDER BY t.created_at DESC LIMIT 100";
        $stmt = $db->execute($query, []);
        echo json_encode($stmt->fetchAll() ?: []);
        exit;
    }

    // GET /api/transactions/{id}
    if (preg_match('/^\/api\/transactions\/(\d+)/', $request_uri, $matches) && $method === 'GET') {
        $transaction_id = $matches[1];
        $query = "SELECT id, user_id, total_amount, transaction_type, created_at FROM transactions WHERE id = ?";
        $stmt = $db->execute($query, [$transaction_id]);
        $result = $stmt->fetch();
        echo json_encode($result ?: null);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
