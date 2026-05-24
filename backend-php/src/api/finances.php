<?php
header('Content-Type: application/json');

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // GET /api/finances/statistics/
    if (preg_match('/^\/api\/finances\/statistics/', $request_uri) && $method === 'GET') {
        $camp_id = $_GET['camp_id'] ?? 1;

        // Total guthaben
        $total_query = "SELECT SUM(balance) as total FROM pocket_money_accounts WHERE camp_id = ?";
        $total_stmt = $db->execute($total_query, [$camp_id]);
        $total_result = $total_stmt->fetch();
        $total_guthaben = $total_result && $total_result['total'] ? (float)$total_result['total'] : 0;

        // Sales sum
        $sales_query = "SELECT SUM(total_amount) as total FROM transactions WHERE transaction_type = 'purchase' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        $sales_stmt = $db->execute($sales_query, []);
        $sales_result = $sales_stmt->fetch();
        $recent_sales = $sales_result && $sales_result['total'] ? (float)$sales_result['total'] : 0;

        echo json_encode([
            'total_guthaben' => $total_guthaben,
            'recent_sales' => $recent_sales,
            'camp_id' => $camp_id
        ]);
        exit;
    }

    // GET /api/finances/
    if ($request_uri === '/api/finances/' && $method === 'GET') {
        $camp_id = $_GET['camp_id'] ?? 1;
        $query = "SELECT pa.id, pa.participant_id, pa.balance, COUNT(t.id) as transaction_count
                  FROM pocket_money_accounts pa
                  LEFT JOIN transactions t ON pa.participant_id = t.user_id
                  WHERE pa.camp_id = ?
                  GROUP BY pa.id";
        $stmt = $db->execute($query, [$camp_id]);
        echo json_encode($stmt->fetchAll() ?: []);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
