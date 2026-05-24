<?php


$photoRepo = new PhotoRepository();

// GET /photos/?camp_id=1
$router->get('/photos/', function() use ($photoRepo) {
    $camp_id = $_GET['camp_id'] ?? 1;
    $released_only = $_GET['released'] === 'true' ? true : false;

    try {
        if ($released_only) {
            $photos = $photoRepo->getReleasedPhotos($camp_id);
        } else {
            $photos = $photoRepo->getByCampId($camp_id);
        }

        // Ensure we always return an array
        if ($photos === null || !is_array($photos)) {
            $photos = [];
        }

        return json_encode($photos);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// GET /photos/{id}
$router->get('/photos/{id}', function($id) use ($photoRepo) {
    $photo = $photoRepo->getById($id);

    if (!$photo) {
        http_response_code(404);
        return json_encode(['error' => 'Photo not found']);
    }

    return json_encode($photo);
});

// POST /photos/
$router->post('/photos/', function() use ($photoRepo) {
    global $currentUser;

    $camp_id = $_POST['camp_id'] ?? 1;
    $description = $_POST['description'] ?? '';
    $uploaded_by_id = $currentUser['id'] ?? null;

    if (!isset($_FILES['file'])) {
        http_response_code(400);
        return json_encode(['error' => 'No file uploaded']);
    }

    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        return json_encode(['error' => 'Upload error: ' . $file['error']]);
    }

    // Validate file type
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowed_types)) {
        http_response_code(400);
        return json_encode(['error' => 'Invalid file type']);
    }

    // Create uploads directory if it doesn't exist
    $upload_dir = __DIR__ . '/../../public/uploads';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // Generate unique filename
    $filename = uniqid('photo_', true) . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
    $filepath = $upload_dir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        http_response_code(500);
        return json_encode(['error' => 'Failed to save file']);
    }

    try {
        $photo_id = $photoRepo->create($camp_id, $filename, $description, $uploaded_by_id);
        $photo = $photoRepo->getById($photo_id);

        return json_encode([
            'success' => true,
            'photo_id' => $photo_id,
            'photo' => $photo
        ]);
    } catch (Exception $e) {
        // Clean up uploaded file on error
        unlink($filepath);

        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// PATCH /photos/{id}
$router->patch('/photos/{id}', function($id) use ($photoRepo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$photoRepo->update($id, $data)) {
        http_response_code(400);
        return json_encode(['error' => 'Failed to update photo']);
    }

    $photo = $photoRepo->getById($id);
    return json_encode($photo);
});

// DELETE /photos/{id}
$router->delete('/photos/{id}', function($id) use ($photoRepo) {
    if (!$photoRepo->delete($id)) {
        http_response_code(500);
        return json_encode(['error' => 'Failed to delete photo']);
    }

    return json_encode(['success' => true, 'message' => 'Photo deleted']);
});

// POST /photos/{id}/release
$router->post('/photos/{id}/release', function($id) use ($photoRepo) {
    $photoRepo->release($id, true);
    return json_encode(['success' => true, 'message' => 'Photo released']);
});

// POST /photos/{id}/unreleased
$router->post('/photos/{id}/unreleased', function($id) use ($photoRepo) {
    $photoRepo->release($id, false);
    return json_encode(['success' => true, 'message' => 'Photo unreleased']);
});
