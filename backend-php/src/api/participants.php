<?php
$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    $pdo = $db->getConnection();

    // GET /api/participants/
    if ($path === '/api/participants/' && $method === 'GET') {
        $camp_id = (int)($_GET['camp_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT p.id, p.camp_id, p.vorname, p.nachname, p.`alter`, p.geschlecht, p.kontakt_name, p.kontakt_email, p.kontakt_tel, p.checked_in, p.checked_in_at, COALESCE(pma.balance, 0) as guthaben FROM participants p LEFT JOIN pocket_money_accounts pma ON p.id = pma.participant_id AND pma.camp_id = p.camp_id WHERE p.camp_id = ? ORDER BY p.vorname");
        $stmt->execute([$camp_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC) ?: []);
        exit;
    }

    // GET /api/participants/{id}
    if (preg_match('/^\/api\/participants\/(\d+)/', $path, $m) && $method === 'GET') {
        $participant_id = (int)$m[1];
        $camp_id = (int)($_GET['camp_id'] ?? 1);
        $stmt = $pdo->prepare("SELECT p.id, p.camp_id, p.vorname, p.nachname, p.`alter`, p.geschlecht, p.kontakt_name, p.kontakt_email, p.kontakt_tel, p.checked_in, p.checked_in_at, COALESCE(pma.balance, 0) as guthaben FROM participants p LEFT JOIN pocket_money_accounts pma ON p.id = pma.participant_id AND pma.camp_id = p.camp_id WHERE p.id = ? AND p.camp_id = ?");
        $stmt->execute([$participant_id, $camp_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            http_response_code(404);
            echo json_encode(['error' => 'Participant not found']);
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
