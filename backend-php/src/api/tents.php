<?php


$tentRepo = new TentRepository();

// GET /tents/?camp_id=1
$router->get('/tents/', function() use ($tentRepo) {
    $camp_id = $_GET['camp_id'] ?? 1;
    $tents = $tentRepo->getByCampId($camp_id);
    return json_encode($tents);
});

// GET /tents/{id}
$router->get('/tents/{id}', function($id) use ($tentRepo) {
    $tent = $tentRepo->getById($id);

    if (!$tent) {
        http_response_code(404);
        return json_encode(['error' => 'Tent not found']);
    }

    return json_encode($tent);
});

// POST /tents/
$router->post('/tents/', function() use ($tentRepo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $camp_id = $_GET['camp_id'] ?? 1;
    $name = $data['name'] ?? null;
    $capacity = $data['capacity'] ?? 8;

    if (!$name) {
        http_response_code(400);
        return json_encode(['error' => 'Missing tent name']);
    }

    try {
        $tent_id = $tentRepo->create($camp_id, $name, $capacity);
        $tent = $tentRepo->getById($tent_id);

        return json_encode([
            'success' => true,
            'tent_id' => $tent_id,
            'tent' => $tent
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// PATCH /tents/{id}
$router->patch('/tents/{id}', function($id) use ($tentRepo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$tentRepo->update($id, $data)) {
        http_response_code(400);
        return json_encode(['error' => 'Failed to update tent']);
    }

    $tent = $tentRepo->getById($id);
    return json_encode($tent);
});

// DELETE /tents/{id}
$router->delete('/tents/{id}', function($id) use ($tentRepo) {
    if (!$tentRepo->delete($id)) {
        http_response_code(400);
        return json_encode(['error' => 'Cannot delete tent with occupants']);
    }

    return json_encode(['success' => true, 'message' => 'Tent deleted']);
});

// POST /tents/{id}/assign-participant/{participant_id}
$router->post('/tents/{id}/assign-participant/{participant_id}', function($id, $participant_id) use ($tentRepo) {
    if (!$tentRepo->assignParticipant($id, $participant_id)) {
        http_response_code(400);
        return json_encode(['error' => 'Failed to assign participant or tent full']);
    }

    return json_encode([
        'success' => true,
        'message' => 'Participant assigned',
        'tent' => $tentRepo->getById($id)
    ]);
});

// GET /tents/{id}/members
$router->get('/tents/{id}/members', function($id) use ($tentRepo) {
    $members = $tentRepo->getMembers($id);
    return json_encode($members);
});
