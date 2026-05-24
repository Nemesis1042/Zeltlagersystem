<?php

$transactionRepo = new TransactionRepository();
$participantRepo = new ParticipantRepository();

// GET /transactions/ - Alle Transaktionen für ein Camp
$router->get('/transactions/', function() use ($transactionRepo) {
    try {
        $camp_id = $_GET['camp_id'] ?? 1;
        $transactions = $transactionRepo->getByCampId($camp_id);
        return json_encode($transactions ?? []);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// GET /transactions/{id} - Einzelne Transaktion
$router->get('/transactions/{id}', function($id) use ($transactionRepo) {
    try {
        $transaction = $transactionRepo->getById($id);

        if (!$transaction) {
            http_response_code(404);
            return json_encode(['error' => 'Transaktion nicht gefunden']);
        }

        return json_encode($transaction);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// POST /transactions/ - Neue Transaktion
$router->post('/transactions/', function() use ($transactionRepo, $participantRepo) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['participant_id']) || !isset($data['amount'])) {
            http_response_code(400);
            return json_encode(['error' => 'Teilnehmer und Betrag erforderlich']);
        }

        $transaction_id = $transactionRepo->create(
            $data['participant_id'],
            $data['product_name'] ?? '',
            $data['amount'],
            $data['description'] ?? '',
            $data['ma_user_id'] ?? null
        );

        if (!$transaction_id) {
            http_response_code(500);
            return json_encode(['error' => 'Transaktion konnte nicht erstellt werden']);
        }

        $transaction = $transactionRepo->getById($transaction_id);
        http_response_code(201);
        return json_encode([
            'success' => true,
            'transaction_id' => $transaction_id,
            'transaction' => $transaction
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// GET /finances/statistics/ - Finanzstatistiken für ein Camp
$router->get('/finances/statistics/', function() use ($transactionRepo, $participantRepo) {
    try {
        $camp_id = $_GET['camp_id'] ?? 1;

        $participants = $participantRepo->getByCampId($camp_id);
        $transactions = $transactionRepo->getByCampId($camp_id);

        $total_income = 0;
        $total_expenses = 0;

        foreach ($transactions as $trans) {
            if ($trans['amount'] > 0) {
                $total_income += $trans['amount'];
            } else {
                $total_expenses += $trans['amount'];
            }
        }

        $net_balance = $total_income + $total_expenses;

        return json_encode([
            'total_participants' => count($participants),
            'total_transactions' => count($transactions),
            'total_income' => $total_income,
            'total_expenses' => $total_expenses,
            'net_balance' => $net_balance
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});
?>
