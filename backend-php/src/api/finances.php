<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/finances/statistics/
    if (preg_match('/^\/api\/finances\/statistics/', $path) && $method === 'GET') {
        $camp_id = (int)($_GET['camp_id'] ?? 1);

        // Total guthaben
        $stmt = $pdo->prepare("SELECT SUM(balance) as total FROM pocket_money_accounts WHERE camp_id = ?");
        $stmt->execute([$camp_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $total_guthaben = $result['total'] ? (float)$result['total'] : 0;

        // Total sales
        $stmt = $pdo->query("SELECT SUM(total_amount) as total FROM transactions WHERE transaction_type = 'purchase'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $recent_sales = $result['total'] ? (float)$result['total'] : 0;

        echo json_encode(['total_guthaben' => $total_guthaben, 'recent_sales' => $recent_sales, 'camp_id' => $camp_id]);
        exit;
    }

    // GET /api/finances/
    if ($path === '/api/finances/' && $method === 'GET') {
        $camp_id = (int)($_GET['camp_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT pa.id, pa.participant_id, pa.balance FROM pocket_money_accounts pa WHERE pa.camp_id = ? ORDER BY pa.participant_id");
        $stmt->execute([$camp_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
