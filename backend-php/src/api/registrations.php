<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // POST /api/registrations/
    if ($path === '/api/registrations/' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['tn_familienname']) || !isset($input['tn_vorname'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Teilnehmer Name erforderlich']);
            exit;
        }

        if (!isset($input['sorge_familienname']) || !isset($input['sorge_email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Sorgeberechtigte Daten erforderlich']);
            exit;
        }

        $camp_id = (int)($input['camp_id'] ?? 1);
        $create_account = (bool)($input['create_account'] ?? false);
        $user_id = null;

        if ($create_account) {
            if (!isset($input['email']) || !isset($input['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Email und Passwort erforderlich für Login-Account']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$input['email']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'Diese Email-Adresse existiert bereits']);
                exit;
            }

            $password = password_hash($input['password'], PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("INSERT INTO users (email, password, vorname, nachname, role) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['email'],
                $password,
                $input['tn_vorname'],
                $input['tn_familienname'],
                'eltern'
            ]);
            $user_id = $pdo->lastInsertId();
        }

        // Create participant registration (Anmeldung)
        $stmt = $pdo->prepare("INSERT INTO participants (camp_id, vorname, nachname, geschlecht, kontakt_name, kontakt_email, kontakt_tel) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $camp_id,
            $input['tn_vorname'],
            $input['tn_familienname'],
            $input['tn_geschlecht'] ?? null,
            $input['sorge_familienname'],
            $input['sorge_email'],
            $input['sorge_tel'] ?? null
        ]);
        $registration_id = $pdo->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'registration_id' => $registration_id,
            'user_id' => $user_id,
            'message' => 'Anmeldung erfolgreich erstellt'
        ]);
        exit;
    }

    // GET /api/registrations/ - get all registrations for camp
    if ($path === '/api/registrations/' && $method === 'GET') {
        $camp_id = (int)($_GET['camp_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT id, camp_id, vorname, nachname, geschlecht, kontakt_name, kontakt_email, kontakt_tel FROM participants WHERE camp_id = ? ORDER BY nachname, vorname");
        $stmt->execute([$camp_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // GET /api/registrations/{id}
    if (preg_match('/^\/api\/registrations\/(\d+)/', $path, $m) && $method === 'GET') {
        $registration_id = (int)$m[1];
        $stmt = $pdo->prepare("SELECT id, camp_id, vorname, nachname, geschlecht, kontakt_name, kontakt_email, kontakt_tel FROM participants WHERE id = ?");
        $stmt->execute([$registration_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Anmeldung nicht gefunden']);
            exit;
        }
        echo json_encode($result);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
?>
