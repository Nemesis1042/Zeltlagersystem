<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/users/
    if ($path === '/api/users/' && $method === 'GET') {
        $stmt = $pdo->query("SELECT id, vorname, nachname, email, role FROM users ORDER BY vorname");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // GET /api/users/{id}
    if (preg_match('/^\/api\/users\/(\d+)/', $path, $m) && $method === 'GET') {
        $user_id = (int)$m[1];
        $stmt = $pdo->prepare("SELECT id, vorname, nachname, email, role FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        echo json_encode($result);
        exit;
    }

    // POST /api/users/
    if ($path === '/api/users/' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['email']) || !isset($input['password']) || !isset($input['vorname']) || !isset($input['nachname'])) {
            http_response_code(400);
            echo json_encode(['error' => 'email, password, vorname, nachname required']);
            exit;
        }

        $password = password_hash($input['password'], PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO users (email, password, vorname, nachname, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['email'],
            $password,
            $input['vorname'],
            $input['nachname'],
            $input['role'] ?? 'eltern'
        ]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    // PATCH /api/users/{id}
    if (preg_match('/^\/api\/users\/(\d+)/', $path, $m) && $method === 'PATCH') {
        $user_id = (int)$m[1];
        $input = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }

        $updates = [];
        $params = [];
        foreach (['vorname', 'nachname', 'email', 'role'] as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = ?";
                $params[] = $input[$field];
            }
        }

        if (isset($input['password'])) {
            $updates[] = "password = ?";
            $params[] = password_hash($input['password'], PASSWORD_BCRYPT);
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $params[] = $user_id;
        $stmt = $pdo->prepare("UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?");
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode(['success' => true]);
        exit;
    }

    // DELETE /api/users/{id}
    if (preg_match('/^\/api\/users\/(\d+)/', $path, $m) && $method === 'DELETE') {
        $user_id = (int)$m[1];

        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$user_id]);

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
