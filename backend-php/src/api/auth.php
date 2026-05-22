<?php
/**
 * Auth API Endpoints
 * /api/auth/login
 * /api/auth/register
 * /api/auth/me
 */

$authService = new AuthService();

// POST /auth/login
$router->post('/auth/login', function() use ($authService) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            return json_encode(['error' => 'Email and password required']);
        }

        $result = $authService->login($data['email'], $data['password']);

        if (!$result) {
            http_response_code(401);
            return json_encode(['error' => 'Invalid credentials']);
        }

        return json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// POST /auth/register
$router->post('/auth/register', function() use ($authService) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        $required = ['email', 'password', 'vorname', 'nachname'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                return json_encode(['error' => $field . ' required']);
            }
        }

        $role = $data['role'] ?? 'ma';

        $result = $authService->register(
            $data['email'],
            $data['password'],
            $data['vorname'],
            $data['nachname'],
            $role
        );

        http_response_code(201);
        return json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// GET /auth/me
$router->get('/auth/me', function() use ($authService) {
    try {
        $user = $authService->getCurrentUser();

        if (!$user) {
            http_response_code(401);
            return json_encode(['error' => 'Unauthorized']);
        }

        return json_encode($user);
    } catch (Exception $e) {
        http_response_code(401);
        return json_encode(['error' => $e->getMessage()]);
    }
});
