<?php
/**
 * Set Admin Password
 * Run this once to set the admin password
 */

require_once __DIR__ . '/backend-php/config/config.php';
require_once __DIR__ . '/backend-php/config/Database.php';
require_once __DIR__ . '/backend-php/src/repositories/UserRepository.php';

$userRepo = new UserRepository();

// Password to set
$password = "Bula2026!";
$password_hash = password_hash($password, PASSWORD_BCRYPT);

// Update admin account
$admin = $userRepo->update(1, [
    'password_hash' => $password_hash
]);

if ($admin) {
    echo "✅ Admin password set successfully!\n";
    echo "Email: admin@lagerbank.info\n";
    echo "Password: {$password}\n";
} else {
    echo "❌ Failed to set admin password\n";
    // Try to create admin account if it doesn't exist
    $newAdmin = $userRepo->create([
        'email' => 'admin@lagerbank.info',
        'password_hash' => $password_hash,
        'vorname' => 'Admin',
        'nachname' => 'Account',
        'role' => 'admin'
    ]);

    if ($newAdmin) {
        echo "✅ Admin account created successfully!\n";
        echo "Email: admin@lagerbank.info\n";
        echo "Password: {$password}\n";
    } else {
        echo "❌ Failed to create admin account\n";
    }
}
?>
