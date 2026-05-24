<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/check-in/status/{id}
    if (preg_match('/^\/api\/check-in\/status\/(\d+)/', $path, $m) && $method === 'GET') {
        $participant_id = (int)$m[1];
        $camp_id = (int)($_GET['camp_id'] ?? 1);

        $stmt = $pdo->prepare("SELECT id, participant_id, camp_id, checked_in, checked_in_at FROM check_ins WHERE participant_id = ? AND camp_id = ?");
        $stmt->execute([$participant_id, $camp_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode($result ?: ['participant_id' => $participant_id, 'camp_id' => $camp_id, 'checked_in' => 0, 'checked_in_at' => null]);
        exit;
    }

    // GET /api/check-in/
    if ($path === '/api/check-in/' && $method === 'GET') {
        $camp_id = (int)($_GET['camp_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT id, participant_id, camp_id, checked_in, checked_in_at FROM check_ins WHERE camp_id = ?");
        $stmt->execute([$camp_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // POST /api/check-in/
    if ($path === '/api/check-in/' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['participant_id']) || !isset($input['camp_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'participant_id and camp_id required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO check_ins (participant_id, camp_id, checked_in, checked_in_at) VALUES (?, ?, ?, NOW())");
        $stmt->execute([
            (int)$input['participant_id'],
            (int)$input['camp_id'],
            1
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    // PATCH /api/check-in/{id}
    if (preg_match('/^\/api\/check-in\/(\d+)/', $path, $m) && $method === 'PATCH') {
        $check_in_id = (int)$m[1];
        $input = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare("SELECT id FROM check_ins WHERE id = ?");
        $stmt->execute([$check_in_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Check-in not found']);
            exit;
        }

        $updates = [];
        $params = [];
        if (isset($input['checked_in'])) {
            $updates[] = "checked_in = ?";
            $params[] = (int)$input['checked_in'];
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $params[] = $check_in_id;
        $stmt = $pdo->prepare("UPDATE check_ins SET " . implode(", ", $updates) . " WHERE id = ?");
        $stmt->execute($params);

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
