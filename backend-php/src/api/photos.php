<?php

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// GET /api/photos/?camp_id=1
if ($method === 'GET' && preg_match('/^\/api\/photos\/$/', $path)) {
    $camp_id = $_GET['camp_id'] ?? 1;
    
    $stmt = $db->execute(
        'SELECT id, filename, description, released, created_at FROM photos WHERE camp_id = ? ORDER BY created_at DESC',
        [$camp_id]
    );
    
    $photos = $stmt->fetchAll();
    echo json_encode($photos ?: []);
    exit;
}

// GET /api/photos/{id}
if ($method === 'GET' && preg_match('/^\/api\/photos\/(\d+)\/$/', $path, $matches)) {
    $photo_id = $matches[1];
    
    $stmt = $db->execute(
        'SELECT id, filename, description, released, created_at FROM photos WHERE id = ?',
        [$photo_id]
    );
    
    $photo = $stmt->fetch();
    echo json_encode($photo ?: null);
    exit;
}

// POST /api/photos/ - Upload
if ($method === 'POST' && preg_match('/^\/api\/photos\/$/', $path)) {
    $camp_id = $_POST['camp_id'] ?? 1;
    $description = $_POST['description'] ?? '';
    $released = $_POST['released'] ?? 0;
    
    if (empty($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded']);
        exit;
    }
    
    $file = $_FILES['file'];
    $filename = uniqid() . '_' . basename($file['name']);
    $target = __DIR__ . '/../../public/uploads/photos/' . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $target)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save file']);
        exit;
    }
    
    $stmt = $db->execute(
        'INSERT INTO photos (camp_id, filename, description, released, created_at) VALUES (?, ?, ?, ?, NOW())',
        [$camp_id, $filename, $description, $released]
    );
    
    echo json_encode(['id' => $db->getConnection()->lastInsertId(), 'filename' => $filename]);
    exit;
}

// PATCH /api/photos/{id}
if ($method === 'PATCH' && preg_match('/^\/api\/photos\/(\d+)\/$/', $path, $matches)) {
    $photo_id = $matches[1];
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['released'])) {
        $db->execute(
            'UPDATE photos SET released = ? WHERE id = ?',
            [$data['released'] ? 1 : 0, $photo_id]
        );
    }
    
    if (isset($data['description'])) {
        $db->execute(
            'UPDATE photos SET description = ? WHERE id = ?',
            [$data['description'], $photo_id]
        );
    }
    
    echo json_encode(['success' => true]);
    exit;
}

// DELETE /api/photos/{id}
if ($method === 'DELETE' && preg_match('/^\/api\/photos\/(\d+)\/$/', $path, $matches)) {
    $photo_id = $matches[1];
    
    // Get filename to delete file
    $stmt = $db->execute('SELECT filename FROM photos WHERE id = ?', [$photo_id]);
    $photo = $stmt->fetch();
    
    if ($photo) {
        $file = __DIR__ . '/../../public/uploads/photos/' . $photo['filename'];
        if (file_exists($file)) {
            unlink($file);
        }
    }
    
    $db->execute('DELETE FROM photos WHERE id = ?', [$photo_id]);
    
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
