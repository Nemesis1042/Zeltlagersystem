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
        $total_result = $db->execute($total_query, [$camp_id]);
        $total_guthaben = $total_result && $total_result[0]['total'] ? (float)$total_result[0]['total'] : 0;

        // Sales sum
        $sales_query = "SELECT SUM(amount) as total FROM transactions WHERE type = 'sale' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        $sales_result = $db->execute($sales_query, []);
        $recent_sales = $sales_result && $sales_result[0]['total'] ? (float)$sales_result[0]['total'] : 0;

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
                  LEFT JOIN transactions t ON pa.id = t.account_id 
                  WHERE pa.camp_id = ? 
                  GROUP BY pa.id";
        $result = $db->execute($query, [$camp_id]);
        echo json_encode($result ?: []);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
