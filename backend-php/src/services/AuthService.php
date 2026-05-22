<?php
/**
 * Authentication Service
 * Verwaltet Login, Registration und JWT
 */

require_once __DIR__ . '/../repositories/UserRepository.php';

class AuthService {
    private $userRepo;

    public function __construct() {
        $this->userRepo = new UserRepository();
    }

    /**
     * Login mit Email/Password
     */
    public function login($email, $password) {
        $user = $this->userRepo->findByEmail($email);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new Exception('Ungültige Email oder Passwort', 401);
        }

        if (!$user['active']) {
            throw new Exception('Benutzer ist inaktiv', 403);
        }

        return array(
            'token' => $this->generateJWT($user),
            'user' => $this->sanitizeUser($user)
        );
    }

    /**
     * Registration - Neue Benutzer (Staff/Admin)
     */
    public function register($email, $password, $vorname, $nachname, $role = 'ma') {
        // Überprüfe ob Email existiert
        if ($this->userRepo->findByEmail($email)) {
            throw new Exception('Email existiert bereits', 400);
        }

        // Erstelle neuen Benutzer
        $userId = $this->userRepo->create(array(
            'email' => $email,
            'password_hash' => password_hash($password, PASSWORD_BCRYPT),
            'vorname' => $vorname,
            'nachname' => $nachname,
            'role' => $role,
            'active' => true
        ));

        $user = $this->userRepo->findById($userId);

        return array(
            'token' => $this->generateJWT($user),
            'user' => $this->sanitizeUser($user)
        );
    }

    /**
     * JWT Token generieren
     */
    public function generateJWT($user) {
        $header = json_encode(array('alg' => 'HS256', 'typ' => 'JWT'));
        $payload = json_encode(array(
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + JWT_EXPIRY
        ));

        $header = base64_encode($header);
        $payload = base64_encode($payload);
        $signature = hash_hmac('sha256', $header . '.' . $payload, JWT_SECRET, true);
        $signature = base64_encode($signature);

        return $header . '.' . $payload . '.' . $signature;
    }

    /**
     * JWT Token validieren
     */
    public function validateJWT($token) {
        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                throw new Exception('Ungültiges Token Format');
            }

            $header = json_decode(base64_decode($parts[0]), true);
            $payload = json_decode(base64_decode($parts[1]), true);
            $signature = $parts[2];

            // Überprüfe Ablauf
            if ($payload['exp'] < time()) {
                throw new Exception('Token ist abgelaufen');
            }

            // Überprüfe Signatur
            $expectedSignature = base64_encode(hash_hmac(
                'sha256',
                $parts[0] . '.' . $parts[1],
                JWT_SECRET,
                true
            ));

            if (!hash_equals($signature, $expectedSignature)) {
                throw new Exception('Ungültige Signatur');
            }

            return $payload;
        } catch (Exception $e) {
            throw new Exception('Token-Validierung fehlgeschlagen: ' . $e->getMessage());
        }
    }

    /**
     * Benutzer aus Auth-Request holen
     */
    public function getCurrentUser() {
        $headers = getallheaders();
        $auth = isset($headers['Authorization']) ? $headers['Authorization'] : '';

        if (empty($auth) || !preg_match('/Bearer\s+(.+)/', $auth, $matches)) {
            throw new Exception('Authentifizierung erforderlich', 401);
        }

        $payload = $this->validateJWT($matches[1]);
        return $this->userRepo->findById($payload['user_id']);
    }

    /**
     * Sichere sensitive Daten
     */
    private function sanitizeUser($user) {
        unset($user['password_hash']);
        return $user;
    }
}
