<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/activities/
    if ($path === '/api/activities/' && $method === 'GET') {
        $camp_id = (int)($_GET['camp_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT id, camp_id, name, beschreibung, datum, uhrzeit, ort FROM activities WHERE camp_id = ? ORDER BY datum");
        $stmt->execute([$camp_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // GET /api/activities/{id}
    if (preg_match('/^\/api\/activities\/(\d+)/', $path, $m) && $method === 'GET') {
        $activity_id = (int)$m[1];
        $stmt = $pdo->prepare("SELECT id, camp_id, name, beschreibung, datum, uhrzeit, ort FROM activities WHERE id = ?");
        $stmt->execute([$activity_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Activity not found']);
            exit;
        }
        echo json_encode($result);
        exit;
    }

    // POST /api/activities/
    if ($path === '/api/activities/' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['name']) || !isset($input['camp_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'name and camp_id required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO activities (camp_id, name, beschreibung, datum, uhrzeit, ort) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            (int)$input['camp_id'],
            $input['name'],
            $input['beschreibung'] ?? null,
            $input['datum'] ?? null,
            $input['uhrzeit'] ?? null,
            $input['ort'] ?? null
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    // PATCH /api/activities/{id}
    if (preg_match('/^\/api\/activities\/(\d+)/', $path, $m) && $method === 'PATCH') {
        $activity_id = (int)$m[1];
        $input = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare("SELECT id FROM activities WHERE id = ?");
        $stmt->execute([$activity_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Activity not found']);
            exit;
        }

        $updates = [];
        $params = [];
        foreach (['name', 'beschreibung', 'datum', 'uhrzeit', 'ort'] as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = ?";
                $params[] = $input[$field];
            }
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $params[] = $activity_id;
        $stmt = $pdo->prepare("UPDATE activities SET " . implode(", ", $updates) . " WHERE id = ?");
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode(['success' => true]);
        exit;
    }

    // DELETE /api/activities/{id}
    if (preg_match('/^\/api\/activities\/(\d+)/', $path, $m) && $method === 'DELETE') {
        $activity_id = (int)$m[1];

        $stmt = $pdo->prepare("SELECT id FROM activities WHERE id = ?");
        $stmt->execute([$activity_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Activity not found']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM activities WHERE id = ?");
        $stmt->execute([$activity_id]);

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
