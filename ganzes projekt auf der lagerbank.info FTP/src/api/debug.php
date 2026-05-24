<?php
// Debug endpoint - shows what's happening
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../config/config.php';
    require_once __DIR__ . '/../config/Database.php';

    $db = Database::getInstance();
    $pdo = $db->getConnection();

    // Test 1: Database connection
    $stmt = $pdo->query("SELECT 1");
    $test1 = "✓ Database connected";

    // Test 2: Check tables exist
    $stmt = $pdo->query("SHOW TABLES LIKE 'participants'");
    $tables = $stmt->fetchAll();
    $test2 = count($tables) > 0 ? "✓ Participants table exists" : "✗ Table missing";

    // Test 3: Try to fetch participants
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM participants WHERE camp_id = ?");
    $stmt->execute([1]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $test3 = "✓ Found " . $result['count'] . " participants";

    echo json_encode([
        'status' => 'ok',
        'tests' => [$test1, $test2, $test3],
        'errors' => []
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
