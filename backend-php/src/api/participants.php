<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/participants/
    if ($path === '/api/participants/' && $method === 'GET') {
        $camp_id = (int)($_GET['camp_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT p.id, p.camp_id, p.vorname, p.nachname, p.`alter`, p.geschlecht, p.kontakt_name, p.kontakt_email, p.kontakt_tel, p.checked_in, p.checked_in_at, COALESCE(pma.balance, 0) as guthaben FROM participants p LEFT JOIN pocket_money_accounts pma ON p.id = pma.participant_id AND pma.camp_id = p.camp_id WHERE p.camp_id = ? ORDER BY p.vorname");
        $stmt->execute([$camp_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // GET /api/participants/{id}
    if (preg_match('/^\/api\/participants\/(\d+)/', $path, $m) && $method === 'GET') {
        $participant_id = (int)$m[1];
        $camp_id = (int)($_GET['camp_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT p.id, p.camp_id, p.vorname, p.nachname, p.`alter`, p.geschlecht, p.kontakt_name, p.kontakt_email, p.kontakt_tel, p.checked_in, p.checked_in_at, COALESCE(pma.balance, 0) as guthaben FROM participants p LEFT JOIN pocket_money_accounts pma ON p.id = pma.participant_id AND pma.camp_id = p.camp_id WHERE p.id = ? AND p.camp_id = ?");
        $stmt->execute([$participant_id, $camp_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Participant not found']);
            exit;
        }
        echo json_encode($result);
        exit;
    }

    // POST /api/participants/
    if ($path === '/api/participants/' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['vorname']) || !isset($input['nachname']) || !isset($input['camp_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'vorname, nachname, camp_id required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO participants (camp_id, vorname, nachname, `alter`, geschlecht, kontakt_name, kontakt_email, kontakt_tel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            (int)$input['camp_id'],
            $input['vorname'],
            $input['nachname'],
            $input['alter'] ?? null,
            $input['geschlecht'] ?? null,
            $input['kontakt_name'] ?? null,
            $input['kontakt_email'] ?? null,
            $input['kontakt_tel'] ?? null
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    // PATCH /api/participants/{id}
    if (preg_match('/^\/api\/participants\/(\d+)/', $path, $m) && $method === 'PATCH') {
        $participant_id = (int)$m[1];
        $input = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare("SELECT id FROM participants WHERE id = ?");
        $stmt->execute([$participant_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Participant not found']);
            exit;
        }

        $updates = [];
        $params = [];
        foreach (['vorname', 'nachname', 'alter', 'geschlecht', 'kontakt_name', 'kontakt_email', 'kontakt_tel', 'checked_in'] as $field) {
            if (isset($input[$field])) {
                $fieldName = ($field === 'alter') ? '`alter`' : $field;
                $updates[] = "$fieldName = ?";
                $params[] = $input[$field];
            }
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $params[] = $participant_id;
        $stmt = $pdo->prepare("UPDATE participants SET " . implode(", ", $updates) . " WHERE id = ?");
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode(['success' => true]);
        exit;
    }

    // DELETE /api/participants/{id}
    if (preg_match('/^\/api\/participants\/(\d+)/', $path, $m) && $method === 'DELETE') {
        $participant_id = (int)$m[1];

        $stmt = $pdo->prepare("SELECT id FROM participants WHERE id = ?");
        $stmt->execute([$participant_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Participant not found']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM participants WHERE id = ?");
        $stmt->execute([$participant_id]);

        http_response_code(200);
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
?>
