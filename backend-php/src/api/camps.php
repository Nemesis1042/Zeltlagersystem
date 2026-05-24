<?php

$campRepo = new CampRepository();

// GET /camps/ - Alle Camps
$router->get('/camps/', function() use ($campRepo) {
    try {
        $camps = $campRepo->getAll();
        return json_encode($camps ?? []);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// GET /camps/{id} - Einzelnes Camp
$router->get('/camps/{id}', function($id) use ($campRepo) {
    try {
        $camp = $campRepo->getById($id);

        if (!$camp) {
            http_response_code(404);
            return json_encode(['error' => 'Camp nicht gefunden']);
        }

        return json_encode($camp);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// POST /camps/ - Neues Camp erstellen
$router->post('/camps/', function() use ($campRepo) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['name']) || !isset($data['start_date']) || !isset($data['end_date'])) {
            http_response_code(400);
            return json_encode(['error' => 'Name, Start- und Enddatum erforderlich']);
        }

        $camp_id = $campRepo->create(
            $data['name'],
            $data['start_date'],
            $data['end_date'],
            $data['max_participants'] ?? 50,
            $data['location'] ?? '',
            $data['description'] ?? '',
            $data['fee'] ?? 0,
            $data['status'] ?? 'active'
        );

        if (!$camp_id) {
            http_response_code(500);
            return json_encode(['error' => 'Camp konnte nicht erstellt werden']);
        }

        $camp = $campRepo->getById($camp_id);
        http_response_code(201);
        return json_encode([
            'success' => true,
            'camp_id' => $camp_id,
            'camp' => $camp
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// PATCH /camps/{id} - Camp bearbeiten
$router->patch('/camps/{id}', function($id) use ($campRepo) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$campRepo->update($id, $data)) {
            http_response_code(400);
            return json_encode(['error' => 'Camp konnte nicht aktualisiert werden']);
        }

        $camp = $campRepo->getById($id);
        return json_encode($camp);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});

// DELETE /camps/{id} - Camp löschen
$router->delete('/camps/{id}', function($id) use ($campRepo) {
    try {
        if (!$campRepo->delete($id)) {
            http_response_code(500);
            return json_encode(['error' => 'Camp konnte nicht gelöscht werden']);
        }

        return json_encode(['success' => true, 'message' => 'Camp gelöscht']);
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(['error' => $e->getMessage()]);
    }
});
?>
