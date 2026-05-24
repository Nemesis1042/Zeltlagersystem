<?php

$userRepo = new UserRepository();

// GET /users/ - Get all users
$router->get('/users/', function() use ($userRepo) {
    $users = $userRepo->getAll();
    return json_encode($users);
});

// GET /users/{id} - Get user by ID
$router->get('/users/{id}', function($id) use ($userRepo) {
    $user = $userRepo->findById($id);

    if (!$user) {
        http_response_code(404);
        return json_encode(['error' => 'User not found']);
    }

    return json_encode($user);
});

// POST /users/ - Create new user
$router->post('/users/', function() use ($userRepo) {
    global $currentUser;

    // Only admins can create users
    if ($currentUser['role'] !== 'admin') {
        http_response_code(403);
        return json_encode(['error' => 'Forbidden']);
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email']) || !isset($data['password_hash']) || !isset($data['vorname']) || !isset($data['nachname'])) {
        http_response_code(400);
        return json_encode(['error' => 'Missing required fields']);
    }

    try {
        $user_id = $userRepo->create($data);
        $user = $userRepo->findById($user_id);

        return json_encode([
            'success' => true,
            'user_id' => $user_id,
            'user' => $user
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// PATCH /users/{id} - Update user
$router->patch('/users/{id}', function($id) use ($userRepo) {
    global $currentUser;

    // Users can only update themselves, admins can update anyone
    if ($currentUser['id'] != $id && $currentUser['role'] !== 'admin') {
        http_response_code(403);
        return json_encode(['error' => 'Forbidden']);
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (!$userRepo->update($id, $data)) {
        http_response_code(400);
        return json_encode(['error' => 'Failed to update user']);
    }

    $user = $userRepo->findById($id);
    return json_encode($user);
});

// DELETE /users/{id} - Delete user
$router->delete('/users/{id}', function($id) use ($userRepo) {
    global $currentUser;

    // Only admins can delete users
    if ($currentUser['role'] !== 'admin') {
        http_response_code(403);
        return json_encode(['error' => 'Forbidden']);
    }

    if (!$userRepo->delete($id)) {
        http_response_code(500);
        return json_encode(['error' => 'Failed to delete user']);
    }

    return json_encode(['success' => true, 'message' => 'User deleted']);
});

// GET /users/{id}/permissions - Get user permissions
$router->get('/users/{id}/permissions', function($id) use ($userRepo) {
    $user = $userRepo->findById($id);

    if (!$user) {
        http_response_code(404);
        return json_encode(['error' => 'User not found']);
    }

    // Define role-based permissions
    $permissions = [
        'admin' => [
            'view_all_participants' => true,
            'edit_all_participants' => true,
            'manage_tents' => true,
            'manage_activities' => true,
            'manage_photos' => true,
            'manage_pocket_money' => true,
            'manage_check_in' => true,
            'manage_users' => true,
            'view_permissions' => true
        ],
        'ma' => [
            'view_all_participants' => true,
            'edit_all_participants' => true,
            'manage_tents' => true,
            'manage_activities' => true,
            'manage_photos' => true,
            'manage_pocket_money' => true,
            'manage_check_in' => true,
            'manage_users' => false,
            'view_permissions' => false
        ],
        'eltern' => [
            'view_all_participants' => false,
            'edit_all_participants' => false,
            'manage_tents' => false,
            'manage_activities' => false,
            'manage_photos' => false,
            'manage_pocket_money' => false,
            'manage_check_in' => false,
            'manage_users' => false,
            'view_permissions' => false
        ]
    ];

    return json_encode([
        'user_id' => $id,
        'role' => $user['role'],
        'permissions' => $permissions[$user['role']] ?? []
    ]);
});

// POST /users/{id}/permissions - Update user permissions (Admin only)
$router->post('/users/{id}/permissions', function($id) use ($userRepo) {
    global $currentUser;

    // Only admins can update permissions
    if ($currentUser['role'] !== 'admin') {
        http_response_code(403);
        return json_encode(['error' => 'Forbidden']);
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $role = $data['role'] ?? null;

    if (!in_array($role, ['admin', 'ma', 'eltern'])) {
        http_response_code(400);
        return json_encode(['error' => 'Invalid role']);
    }

    if (!$userRepo->update($id, ['role' => $role])) {
        http_response_code(500);
        return json_encode(['error' => 'Failed to update user role']);
    }

    $user = $userRepo->findById($id);
    return json_encode($user);
});
