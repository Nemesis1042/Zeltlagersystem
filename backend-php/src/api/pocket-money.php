<?php

$pocketMoneyRepo = new PocketMoneyRepository();
$participantRepo = new ParticipantRepository();

// GET /pocket-money/accounts/{participant_id}
$router->get('/pocket-money/accounts/{participant_id}', function($participant_id) use ($pocketMoneyRepo, $participantRepo) {
    $participant = $participantRepo->getById($participant_id);
    if (!$participant) {
        http_response_code(404);
        return json_encode(['error' => 'Participant not found']);
    }

    $account = $pocketMoneyRepo->getAccountByParticipantId($participant_id);

    if (!$account) {
        // Create account if it doesn't exist
        $account_id = $pocketMoneyRepo->createAccount($participant_id, 0);
        $account = $pocketMoneyRepo->getAccountById($account_id);
    }

    return json_encode($account);
});

// POST /pocket-money/transactions
$router->post('/pocket-money/transactions', function() use ($pocketMoneyRepo, $participantRepo) {
    global $currentUser;

    $data = json_decode(file_get_contents('php://input'), true);
    $participant_id = $data['participant_id'] ?? null;
    $type = $data['type'] ?? 'spending';
    $amount = floatval($data['amount'] ?? 0);
    $description = $data['description'] ?? '';
    $product_id = $data['product_id'] ?? null;

    if (!$participant_id || $amount <= 0) {
        http_response_code(400);
        return json_encode(['error' => 'Invalid participant or amount']);
    }

    $participant = $participantRepo->getById($participant_id);
    if (!$participant) {
        http_response_code(404);
        return json_encode(['error' => 'Participant not found']);
    }

    $account = $pocketMoneyRepo->getAccountByParticipantId($participant_id);
    if (!$account) {
        $account_id = $pocketMoneyRepo->createAccount($participant_id, 0);
        $account = $pocketMoneyRepo->getAccountById($account_id);
    }

    try {
        $transaction_id = $pocketMoneyRepo->addTransaction(
            $account['id'],
            $type,
            $amount,
            $description,
            $product_id
        );

        $updated_account = $pocketMoneyRepo->getAccountById($account['id']);

        return json_encode([
            'success' => true,
            'transaction_id' => $transaction_id,
            'account' => $updated_account
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// GET /pocket-money/accounts/{account_id}/transactions
$router->get('/pocket-money/accounts/{account_id}/transactions', function($account_id) use ($pocketMoneyRepo) {
    $account = $pocketMoneyRepo->getAccountById($account_id);
    if (!$account) {
        http_response_code(404);
        return json_encode(['error' => 'Account not found']);
    }

    $limit = $_GET['limit'] ?? 50;
    $transactions = $pocketMoneyRepo->getTransactions($account_id, $limit);

    return json_encode([
        'account_id' => $account_id,
        'balance' => $account['balance'],
        'transactions' => $transactions
    ]);
});

// GET /pocket-money/accounts/{account_id}
$router->get('/pocket-money/accounts/{account_id}', function($account_id) use ($pocketMoneyRepo) {
    $account = $pocketMoneyRepo->getAccountById($account_id);

    if (!$account) {
        http_response_code(404);
        return json_encode(['error' => 'Account not found']);
    }

    return json_encode($account);
});

// GET /pocket-money/camp/{camp_id}/balance
$router->get('/pocket-money/camp/{camp_id}/balance', function($camp_id) use ($pocketMoneyRepo) {
    $total = $pocketMoneyRepo->getCampTotalBalance($camp_id);
    $accounts = $pocketMoneyRepo->getAccountByCampId($camp_id);

    return json_encode([
        'camp_id' => $camp_id,
        'total_balance' => $total,
        'accounts_count' => count($accounts)
    ]);
});
