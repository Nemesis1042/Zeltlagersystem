<?php
/**
 * Auth API Endpoints
 * /api/auth/login
 * /api/auth/register
 * /api/auth/me
 */

require_once __DIR__ . '/../services/AuthService.php';

class AuthAPI {
    private $auth;

    public function __construct() {
        $this->auth = new AuthService();
    }

    /**
     * POST /api/auth/login
     * Body: { email, password }
     */
    public function login() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['email']) || !isset($data['password'])) {
                throw new Exception('Email und Passwort erforderlich', 400);
            }

            $result = $this->auth->login($data['email'], $data['password']);

            http_response_code(200);
            echo json_encode($result);
        } catch (Exception $e) {
            $this->error($e->getCode() ?: 500, $e->getMessage());
        }
    }

    /**
     * POST /api/auth/register
     * Body: { email, password, vorname, nachname, role }
     */
    public function register() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            $required = array('email', 'password', 'vorname', 'nachname');
            foreach ($required as $field) {
                if (!isset($data[$field])) {
                    throw new Exception($field . ' erforderlich', 400);
                }
            }

            $role = $data['role'] ?? 'ma'; // Default: Mitarbeiter

            $result = $this->auth->register(
                $data['email'],
                $data['password'],
                $data['vorname'],
                $data['nachname'],
                $role
            );

            http_response_code(201);
            echo json_encode($result);
        } catch (Exception $e) {
            $this->error($e->getCode() ?: 500, $e->getMessage());
        }
    }

    /**
     * GET /api/auth/me
     * Gibt aktuelle angemeldete Benutzer zurück
     */
    public function me() {
        try {
            $user = $this->auth->getCurrentUser();
            http_response_code(200);
            echo json_encode($user);
        } catch (Exception $e) {
            $this->error($e->getCode() ?: 401, $e->getMessage());
        }
    }

    /**
     * Error Response
     */
    private function error($code, $message) {
        http_response_code($code);
        echo json_encode(array(
            'error' => $message,
            'code' => $code
        ));
    }
}

// Router-Integration
return new AuthAPI();
