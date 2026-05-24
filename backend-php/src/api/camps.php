<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/camps/
    if ($path === '/api/camps/' && $method === 'GET') {
        $stmt = $pdo->query("SELECT id, name, date_start, date_end, active FROM camps ORDER BY name");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // GET /api/camps/{id}
    if (preg_match('/^\/api\/camps\/(\d+)/', $path, $m) && $method === 'GET') {
        $camp_id = (int)$m[1];
        $stmt = $pdo->prepare("SELECT id, name, date_start, date_end, active FROM camps WHERE id = ?");
        $stmt->execute([$camp_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Camp not found']);
            exit;
        }
        echo json_encode($result);
        exit;
    }

    // POST /api/camps/
    if ($path === '/api/camps/' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['name']) || !isset($input['start_date']) || !isset($input['end_date'])) {
            http_response_code(400);
            echo json_encode(['error' => 'name, start_date, end_date required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO camps (name, date_start, date_end, active) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $input['name'],
            $input['start_date'],
            $input['end_date'],
            $input['active'] ?? 1
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    // PATCH /api/camps/{id}
    if (preg_match('/^\/api\/camps\/(\d+)/', $path, $m) && $method === 'PATCH') {
        $camp_id = (int)$m[1];
        $input = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare("SELECT id FROM camps WHERE id = ?");
        $stmt->execute([$camp_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Camp not found']);
            exit;
        }

        $updates = [];
        $params = [];
        if (isset($input['name'])) {
            $updates[] = "name = ?";
            $params[] = $input['name'];
        }
        if (isset($input['start_date'])) {
            $updates[] = "date_start = ?";
            $params[] = $input['start_date'];
        }
        if (isset($input['end_date'])) {
            $updates[] = "date_end = ?";
            $params[] = $input['end_date'];
        }
        if (isset($input['active'])) {
            $updates[] = "active = ?";
            $params[] = $input['active'];
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $params[] = $camp_id;
        $stmt = $pdo->prepare("UPDATE camps SET " . implode(", ", $updates) . " WHERE id = ?");
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode(['success' => true]);
        exit;
    }

    // DELETE /api/camps/{id}
    if (preg_match('/^\/api\/camps\/(\d+)/', $path, $m) && $method === 'DELETE') {
        $camp_id = (int)$m[1];

        $stmt = $pdo->prepare("SELECT id FROM camps WHERE id = ?");
        $stmt->execute([$camp_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Camp not found']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM camps WHERE id = ?");
        $stmt->execute([$camp_id]);

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
