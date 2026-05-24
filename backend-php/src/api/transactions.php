<?php
header('Content-Type: application/json');

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // GET /api/transactions/
    if ($request_uri === '/api/transactions/' && $method === 'GET') {
        $camp_id = $_GET['camp_id'] ?? 1;
        $query = "SELECT t.id, t.account_id, t.product_id, t.amount, t.type, t.description, t.created_at FROM transactions t
                  JOIN pocket_money_accounts pa ON t.account_id = pa.id
                  WHERE pa.camp_id = ?
                  ORDER BY t.created_at DESC";
        $result = $db->execute($query, [$camp_id]);
        echo json_encode($result ?: []);
        exit;
    }

    // GET /api/transactions/{id}
    if (preg_match('/^\/api\/transactions\/(\d+)/', $request_uri, $matches) && $method === 'GET') {
        $transaction_id = $matches[1];
        $query = "SELECT id, account_id, product_id, amount, type, description, created_at FROM transactions WHERE id = ?";
        $result = $db->execute($query, [$transaction_id]);
        echo json_encode($result ? $result[0] : null);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
