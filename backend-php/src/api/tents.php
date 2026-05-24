<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/tents/
    if ($path === '/api/tents/' && $method === 'GET') {
        $camp_id = (int)($_GET['camp_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT id, camp_id, name, kapazitaet, belegt FROM tents WHERE camp_id = ? ORDER BY name");
        $stmt->execute([$camp_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // GET /api/tents/{id}
    if (preg_match('/^\/api\/tents\/(\d+)/', $path, $m) && $method === 'GET') {
        $tent_id = (int)$m[1];
        $stmt = $pdo->prepare("SELECT id, camp_id, name, kapazitaet, belegt FROM tents WHERE id = ?");
        $stmt->execute([$tent_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Tent not found']);
            exit;
        }
        echo json_encode($result);
        exit;
    }

    // POST /api/tents/
    if ($path === '/api/tents/' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['name']) || !isset($input['camp_id']) || !isset($input['kapazitaet'])) {
            http_response_code(400);
            echo json_encode(['error' => 'name, camp_id, kapazitaet required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO tents (camp_id, name, kapazitaet, belegt) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            (int)$input['camp_id'],
            $input['name'],
            (int)$input['kapazitaet'],
            $input['belegt'] ?? 0
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    // PATCH /api/tents/{id}
    if (preg_match('/^\/api\/tents\/(\d+)/', $path, $m) && $method === 'PATCH') {
        $tent_id = (int)$m[1];
        $input = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare("SELECT id FROM tents WHERE id = ?");
        $stmt->execute([$tent_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Tent not found']);
            exit;
        }

        $updates = [];
        $params = [];
        if (isset($input['name'])) {
            $updates[] = "name = ?";
            $params[] = $input['name'];
        }
        if (isset($input['kapazitaet'])) {
            $updates[] = "kapazitaet = ?";
            $params[] = (int)$input['kapazitaet'];
        }
        if (isset($input['belegt'])) {
            $updates[] = "belegt = ?";
            $params[] = (int)$input['belegt'];
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $params[] = $tent_id;
        $stmt = $pdo->prepare("UPDATE tents SET " . implode(", ", $updates) . " WHERE id = ?");
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode(['success' => true]);
        exit;
    }

    // DELETE /api/tents/{id}
    if (preg_match('/^\/api\/tents\/(\d+)/', $path, $m) && $method === 'DELETE') {
        $tent_id = (int)$m[1];

        $stmt = $pdo->prepare("SELECT id FROM tents WHERE id = ?");
        $stmt->execute([$tent_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Tent not found']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM tents WHERE id = ?");
        $stmt->execute([$tent_id]);

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
