<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/photos/
    if ($path === '/api/photos/' && $method === 'GET') {
        $camp_id = (int)($_GET['camp_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT id, camp_id, filename, description, released, created_at FROM photos WHERE camp_id = ? ORDER BY created_at DESC");
        $stmt->execute([$camp_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // GET /api/photos/{id}
    if (preg_match('/^\/api\/photos\/(\d+)/', $path, $m) && $method === 'GET') {
        $photo_id = (int)$m[1];
        $stmt = $pdo->prepare("SELECT id, camp_id, filename, description, released, created_at FROM photos WHERE id = ?");
        $stmt->execute([$photo_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Photo not found']);
            exit;
        }
        echo json_encode($result);
        exit;
    }

    // POST /api/photos/ (multipart/form-data with file upload)
    if ($path === '/api/photos/' && $method === 'POST') {
        if (empty($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            exit;
        }

        $camp_id = (int)($_POST['camp_id'] ?? 1);
        $description = $_POST['description'] ?? '';
        $released = (int)($_POST['released'] ?? 0);

        $file = $_FILES['file'];
        $filename = uniqid() . '_' . basename($file['name']);
        $uploadDir = __DIR__ . '/../../public/uploads/photos/';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $target = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $target)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save file']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO photos (camp_id, filename, description, released, created_at) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([$camp_id, $filename, $description, $released]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'filename' => $filename]);
        exit;
    }

    // PATCH /api/photos/{id}
    if (preg_match('/^\/api\/photos\/(\d+)/', $path, $m) && $method === 'PATCH') {
        $photo_id = (int)$m[1];
        $input = json_decode(file_get_contents('php://input'), true);

        $stmt = $pdo->prepare("SELECT id FROM photos WHERE id = ?");
        $stmt->execute([$photo_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Photo not found']);
            exit;
        }

        $updates = [];
        $params = [];
        if (isset($input['released'])) {
            $updates[] = "released = ?";
            $params[] = (int)$input['released'];
        }
        if (isset($input['description'])) {
            $updates[] = "description = ?";
            $params[] = $input['description'];
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $params[] = $photo_id;
        $stmt = $pdo->prepare("UPDATE photos SET " . implode(", ", $updates) . " WHERE id = ?");
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode(['success' => true]);
        exit;
    }

    // DELETE /api/photos/{id}
    if (preg_match('/^\/api\/photos\/(\d+)/', $path, $m) && $method === 'DELETE') {
        $photo_id = (int)$m[1];

        $stmt = $pdo->prepare("SELECT filename FROM photos WHERE id = ?");
        $stmt->execute([$photo_id]);
        $photo = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$photo) {
            http_response_code(404);
            echo json_encode(['error' => 'Photo not found']);
            exit;
        }

        $file = __DIR__ . '/../../public/uploads/photos/' . $photo['filename'];
        if (file_exists($file)) {
            unlink($file);
        }

        $stmt = $pdo->prepare("DELETE FROM photos WHERE id = ?");
        $stmt->execute([$photo_id]);

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
