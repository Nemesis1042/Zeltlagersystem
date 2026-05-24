<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // POST /api/auth/login
    if ($path === '/api/auth/login' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['email']) || !isset($input['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            exit;
        }

        $pdo = $db->getConnection();
        $stmt = $pdo->prepare("SELECT id, email, password, vorname, nachname, role FROM users WHERE email = ?");
        $stmt->execute([$input['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($input['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            exit;
        }

        $token = jwt_encode(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role']]);

        echo json_encode([
            'token' => $token,
            'user' => ['id' => $user['id'], 'email' => $user['email'], 'vorname' => $user['vorname'], 'nachname' => $user['nachname'], 'role' => $user['role']]
        ]);
        exit;
    }

    // POST /api/auth/register
    if ($path === '/api/auth/register' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        foreach (['email', 'password', 'vorname', 'nachname'] as $field) {
            if (!isset($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "$field required"]);
                exit;
            }
        }

        $pdo = $db->getConnection();
        $role = $input['role'] ?? 'eltern';
        $password = password_hash($input['password'], PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("INSERT INTO users (email, password, vorname, nachname, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$input['email'], $password, $input['vorname'], $input['nachname'], $role]);

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    // GET /api/auth/me
    if ($path === '/api/auth/me' && $method === 'GET') {
        $token = null;
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $parts = explode(' ', $_SERVER['HTTP_AUTHORIZATION']);
            if (count($parts) === 2 && $parts[0] === 'Bearer') {
                $token = $parts[1];
            }
        }

        if (!$token || !($decoded = jwt_decode($token))) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }

        $pdo = $db->getConnection();
        $stmt = $pdo->prepare("SELECT id, email, vorname, nachname, role FROM users WHERE id = ?");
        $stmt->execute([$decoded['id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }

        echo json_encode($user);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
