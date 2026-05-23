<?php


$participantRepo = new ParticipantRepository();

// GET /check-in/status/{camp_id}
$router->get('/check-in/status/{camp_id}', function($camp_id) use ($participantRepo) {
    $status = $participantRepo->getCheckInStatus($camp_id);
    return json_encode($status);
});

// GET /check-in/list/{camp_id}
$router->get('/check-in/list/{camp_id}', function($camp_id) use ($participantRepo) {
    $list = $participantRepo->getCheckInList($camp_id);
    return json_encode($list);
});

// POST /check-in/
$router->post('/check-in/', function() use ($participantRepo) {
    global $currentUser;

    $data = json_decode(file_get_contents('php://input'), true);
    $participant_id = $data['participant_id'] ?? null;

    if (!$participant_id) {
        http_response_code(400);
        return json_encode(['error' => 'Missing participant_id']);
    }

    $participant = $participantRepo->getById($participant_id);
    if (!$participant) {
        http_response_code(404);
        return json_encode(['error' => 'Participant not found']);
    }

    $checked_in_by_id = $currentUser['id'] ?? null;
    if (!$participantRepo->checkIn($participant_id, $checked_in_by_id)) {
        http_response_code(500);
        return json_encode(['error' => 'Check-in failed']);
    }

    return json_encode([
        'success' => true,
        'message' => 'Check-in successful',
        'participant' => $participantRepo->getById($participant_id)
    ]);
});

// PATCH /check-in/{id}
$router->patch('/check-in/{id}', function($id) use ($participantRepo) {
    global $currentUser;

    $data = json_decode(file_get_contents('php://input'), true);
    $status = $data['status'] ?? null;

    if (!$status) {
        http_response_code(400);
        return json_encode(['error' => 'Missing status']);
    }

    if (!$participantRepo->update($id, ['status' => $status])) {
        http_response_code(400);
        return json_encode(['error' => 'Failed to update status']);
    }

    return json_encode(['success' => true, 'participant' => $participantRepo->getById($id)]);
});
