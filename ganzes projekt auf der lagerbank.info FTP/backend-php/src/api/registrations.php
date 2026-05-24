<?php

$registrationRepo = new RegistrationRepository();
$userRepo = new UserRepository();

// POST /registrations/ - Neue Anmeldung erstellen
$router->post('/registrations/', function() use ($registrationRepo, $userRepo) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['tn_familienname']) || !isset($data['tn_vorname'])) {
            http_response_code(400);
            return json_encode(['error' => 'Teilnehmer Name erforderlich']);
        }

        if (!isset($data['sorge_familienname']) || !isset($data['sorge_email'])) {
            http_response_code(400);
            return json_encode(['error' => 'Sorgeberechtigte Daten erforderlich']);
        }

        // Check if user wants to create login account
        $create_account = $data['create_account'] ?? false;
        $user_id = null;

        if ($create_account) {
            if (!isset($data['email']) || !isset($data['password'])) {
                http_response_code(400);
                return json_encode(['error' => 'Email und Passwort erforderlich für Login-Account']);
            }

            // Check if email already exists
            $existing = $userRepo->findByEmail($data['email']);
            if ($existing) {
                http_response_code(400);
                return json_encode(['error' => 'Diese Email-Adresse existiert bereits']);
            }

            // Create user account
            $user_id = $userRepo->create([
                'email' => $data['email'],
                'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
                'vorname' => $data['tn_vorname'],
                'nachname' => $data['tn_familienname'],
                'role' => 'eltern'
            ]);
        }

        // Default camp_id = 1 (hauptcamp)
        $camp_id = $data['camp_id'] ?? 1;

        $registration_id = $registrationRepo->create($camp_id, $data, $user_id);

        if (!$registration_id) {
            http_response_code(500);
            return json_encode(['error' => 'Anmeldung konnte nicht erstellt werden']);
        }

        http_response_code(201);
        return json_encode([
            'success' => true,
            'registration_id' => $registration_id,
            'user_id' => $user_id,
            'message' => 'Anmeldung erfolgreich erstellt'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// GET /registrations/{id} - Anmeldung abrufen
$router->get('/registrations/{id}', function($id) use ($registrationRepo) {
    $registration = $registrationRepo->getById($id);
    if (!$registration) {
        http_response_code(404);
        return json_encode(['error' => 'Anmeldung nicht gefunden']);
    }
    return json_encode($registration);
});

// GET /registrations/camp/{camp_id} - Alle Anmeldungen eines Camps
$router->get('/registrations/camp/{camp_id}', function($camp_id) use ($registrationRepo) {
    $registrations = $registrationRepo->getByCampId($camp_id);
    return json_encode($registrations);
});

// GET /plz-lookup/{plz} - PLZ zu Stadt Lookup (für Auto-Fill)
$router->get('/plz-lookup/{plz}', function($plz) use ($registrationRepo) {
    $ort = $registrationRepo->getOrtByPlz($plz);

    if ($ort) {
        return json_encode([
            'plz' => $plz,
            'ort' => $ort
        ]);
    }

    // Fallback: Common German cities PLZ Mapping
    $plzMap = [
        '10115' => 'Berlin',
        '10117' => 'Berlin',
        '10119' => 'Berlin',
        '10178' => 'Berlin',
        '20095' => 'Hamburg',
        '20099' => 'Hamburg',
        '20457' => 'Hamburg',
        '50667' => 'Köln',
        '50668' => 'Köln',
        '50674' => 'Köln',
        '80331' => 'München',
        '80333' => 'München',
        '80335' => 'München',
        '40212' => 'Düsseldorf',
        '40213' => 'Düsseldorf',
        '40221' => 'Düsseldorf',
        '60311' => 'Frankfurt am Main',
        '60313' => 'Frankfurt am Main',
        '70173' => 'Stuttgart',
        '70174' => 'Stuttgart',
        '28195' => 'Bremen',
        '28199' => 'Bremen',
        '30161' => 'Hannover',
        '30163' => 'Hannover',
        '64283' => 'Darmstadt',
        '64285' => 'Darmstadt',
    ];

    if (isset($plzMap[$plz])) {
        return json_encode([
            'plz' => $plz,
            'ort' => $plzMap[$plz]
        ]);
    }

    http_response_code(404);
    return json_encode(['error' => 'PLZ nicht gefunden', 'plz' => $plz]);
});
