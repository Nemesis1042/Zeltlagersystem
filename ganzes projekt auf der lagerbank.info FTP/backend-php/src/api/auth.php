<?php
header('Content-Type: application/json');

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// POST /api/auth/login
if ($request_uri === '/api/auth/login' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        exit;
    }

    $query = "SELECT id, email, password, vorname, nachname, role FROM users WHERE email = ?";
    $stmt = $db->execute($query, [$data['email']]);
    $result = $stmt->fetch();

    if (!$result || !password_verify($data['password'], $result['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }

    $user = $result[0];
    $token = jwt_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role']
    ]);

    echo json_encode([
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'vorname' => $user['vorname'],
            'nachname' => $user['nachname'],
            'role' => $user['role']
        ]
    ]);
    exit;
}

// POST /api/auth/register
if ($request_uri === '/api/auth/register' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $required = ['email', 'password', 'vorname', 'nachname'];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => $field . ' required']);
            exit;
        }
    }

    $role = $data['role'] ?? 'eltern';
    $hashed_password = password_hash($data['password'], PASSWORD_BCRYPT);

    $query = "INSERT INTO users (email, password, vorname, nachname, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    $db->execute($query, [$data['email'], $hashed_password, $data['vorname'], $data['nachname'], $role]);

    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'User registered']);
    exit;
}

// GET /api/auth/me
if ($request_uri === '/api/auth/me' && $method === 'GET') {
    $token = null;
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $parts = explode(' ', $_SERVER['HTTP_AUTHORIZATION']);
        if (count($parts) === 2 && $parts[0] === 'Bearer') {
            $token = $parts[1];
        }
    }

    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $decoded = jwt_decode($token);
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }

    $query = "SELECT id, email, vorname, nachname, role FROM users WHERE id = ?";
    $stmt = $db->execute($query, [$decoded['id']]);
    $result = $stmt->fetch();

    if (!$result) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    echo json_encode($result);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
