<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/pocket-money/participant/{id}
    if (preg_match('/^\/api\/pocket-money\/participant\/(\d+)/', $path, $m) && $method === 'GET') {
        $participant_id = (int)$m[1];
        $camp_id = (int)($_GET['camp_id'] ?? 1);

        $stmt = $pdo->prepare("SELECT id, balance FROM pocket_money_accounts WHERE participant_id = ? AND camp_id = ?");
        $stmt->execute([$participant_id, $camp_id]);
        $account = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$account) {
            $stmt = $pdo->prepare("INSERT INTO pocket_money_accounts (participant_id, camp_id, balance) VALUES (?, ?, 0)");
            $stmt->execute([$participant_id, $camp_id]);
            $account = ['id' => $pdo->lastInsertId(), 'balance' => 0];
        }

        echo json_encode($account);
        exit;
    }

    // POST /api/pocket-money/sale
    if ($path === '/api/pocket-money/sale/' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['account_id']) || !isset($input['product_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'account_id and product_id required']);
            exit;
        }

        $account_id = (int)$input['account_id'];
        $product_id = (int)$input['product_id'];

        // Get product price
        $stmt = $pdo->prepare("SELECT price FROM products WHERE id = ?");
        $stmt->execute([$product_id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            exit;
        }

        // Check balance
        $stmt = $pdo->prepare("SELECT balance FROM pocket_money_accounts WHERE id = ?");
        $stmt->execute([$account_id]);
        $account = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$account || $account['balance'] < $product['price']) {
            http_response_code(400);
            echo json_encode(['error' => 'Insufficient balance']);
            exit;
        }

        // Deduct balance
        $stmt = $pdo->prepare("UPDATE pocket_money_accounts SET balance = balance - ? WHERE id = ?");
        $stmt->execute([$product['price'], $account_id]);

        echo json_encode([
            'success' => true,
            'new_balance' => $account['balance'] - $product['price'],
            'product_price' => $product['price']
        ]);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
