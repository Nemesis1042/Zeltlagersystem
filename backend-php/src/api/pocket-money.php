<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// GET /api/pocket-money/participant/{id}
if ($method === 'GET' && preg_match('/^\/api\/pocket-money\/participant\/(\d+)\/$/', $path, $m)) {
    $participant_id = $m[1];
    $camp_id = $_GET['camp_id'] ?? 1;
    
    $stmt = $db->execute(
        'SELECT id, balance FROM pocket_money_accounts WHERE participant_id = ? AND camp_id = ?',
        [$participant_id, $camp_id]
    );
    $account = $stmt->fetch();
    
    if (!$account) {
        $db->execute(
            'INSERT INTO pocket_money_accounts (participant_id, camp_id, balance) VALUES (?, ?, ?)',
            [$participant_id, $camp_id, 0]
        );
        $account = ['id' => $db->getConnection()->lastInsertId(), 'balance' => 0];
    }
    
    echo json_encode($account);
    exit;
}

// POST /api/pocket-money/sale
if ($method === 'POST' && preg_match('/^\/api\/pocket-money\/sale\/$/', $path)) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $account_id = $data['account_id'] ?? null;
    $product_id = $data['product_id'] ?? null;
    $amount = $data['amount'] ?? 0;
    
    if (!$account_id || !$product_id || !$amount) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    // Get product price
    $stmt = $db->execute('SELECT price FROM products WHERE id = ?', [$product_id]);
    $product = $stmt->fetch();
    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit;
    }
    
    $price = $product['price'];
    
    // Check balance
    $stmt = $db->execute('SELECT balance FROM pocket_money_accounts WHERE id = ?', [$account_id]);
    $account = $stmt->fetch();
    if (!$account || $account['balance'] < $price) {
        http_response_code(400);
        echo json_encode(['error' => 'Insufficient balance']);
        exit;
    }
    
    // Deduct from balance
    $db->execute(
        'UPDATE pocket_money_accounts SET balance = balance - ? WHERE id = ?',
        [$price, $account_id]
    );
    
    // Record transaction
    $db->execute(
        'INSERT INTO transactions (account_id, product_id, amount, type, description) VALUES (?, ?, ?, ?, ?)',
        [$account_id, $product_id, $price, 'sale', 'Product sale']
    );
    
    echo json_encode([
        'success' => true,
        'new_balance' => $account['balance'] - $price,
        'product_price' => $price
    ]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
