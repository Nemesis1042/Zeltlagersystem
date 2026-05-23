<?php


$participantRepo = new ParticipantRepository();
$registrationRepo = new RegistrationRepository();

// GET /participants/?camp_id=1
$router->get('/participants/', function() use ($participantRepo) {
    $camp_id = $_GET['camp_id'] ?? 1;
    $participants = $participantRepo->getByCampId($camp_id);

    return json_encode($participants);
});

// GET /participants/{id}
$router->get('/participants/{id}', function($id) use ($participantRepo) {
    $participant = $participantRepo->getById($id);

    if (!$participant) {
        http_response_code(404);
        return json_encode(['error' => 'Participant not found']);
    }

    return json_encode($participant);
});

// POST /registrations/
$router->post('/registrations/', function() use ($registrationRepo, $participantRepo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $camp_id = $data['camp_id'] ?? 1;

    if (!isset($data['tn_familienname']) || !isset($data['tn_vorname'])) {
        http_response_code(400);
        return json_encode(['error' => 'Missing required fields']);
    }

    try {
        $registration_id = $registrationRepo->create($camp_id, $data);

        // Create participant entry
        $participant_id = $participantRepo->create($camp_id, $registration_id);

        return json_encode([
            'registration_id' => $registration_id,
            'participant_id' => $participant_id
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// GET /registrations/{id}
$router->get('/registrations/{id}', function($id) use ($registrationRepo) {
    $registration = $registrationRepo->getById($id);

    if (!$registration) {
        http_response_code(404);
        return json_encode(['error' => 'Registration not found']);
    }

    return json_encode($registration);
});

// PATCH /participants/{id}
$router->patch('/participants/{id}', function($id) use ($participantRepo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$participantRepo->update($id, $data)) {
        http_response_code(400);
        return json_encode(['error' => 'Failed to update participant']);
    }

    $participant = $participantRepo->getById($id);
    return json_encode($participant);
});
