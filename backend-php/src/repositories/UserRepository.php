<?php
/**
 * User Repository
 * Datenbankzugriffe für Benutzer (auth_users Tabelle)
 */

require_once __DIR__ . '/../../config/Database.php';

class UserRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Benutzer nach Email finden
     */
    public function findByEmail($email) {
        $query = 'SELECT * FROM auth_users WHERE email = :email LIMIT 1';
        $stmt = $this->db->prepare($query);
        $stmt->execute(array(':email' => $email));
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Benutzer nach ID finden
     */
    public function findById($id) {
        $query = 'SELECT * FROM auth_users WHERE id = :id LIMIT 1';
        $stmt = $this->db->prepare($query);
        $stmt->execute(array(':id' => $id));
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Alle Benutzer abrufen
     */
    public function getAll() {
        $query = 'SELECT id, email, vorname, nachname, role, created_at FROM auth_users ORDER BY created_at DESC';
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Neuen Benutzer erstellen
     */
    public function create($data) {
        $query = 'INSERT INTO auth_users (email, password, vorname, nachname, role, created_at)
                  VALUES (:email, :password, :vorname, :nachname, :role, NOW())';

        $stmt = $this->db->prepare($query);
        $stmt->execute(array(
            ':email' => $data['email'],
            ':password' => $data['password_hash'],
            ':vorname' => $data['vorname'],
            ':nachname' => $data['nachname'],
            ':role' => $data['role']
        ));

        return $this->db->lastInsertId();
    }

    /**
     * Benutzer aktualisieren
     */
    public function update($id, $data) {
        $fields = array();
        $values = array(':id' => $id);

        foreach ($data as $key => $value) {
            if ($key === 'password_hash') {
                $fields[] = 'password = :password';
                $values[':password'] = $value;
            } else {
                $fields[] = $key . ' = :' . $key;
                $values[':' . $key] = $value;
            }
        }

        if (empty($fields)) return false;

        $query = 'UPDATE auth_users SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $this->db->prepare($query);
        return $stmt->execute($values);
    }

    /**
     * Benutzer löschen
     */
    public function delete($id) {
        $query = 'DELETE FROM auth_users WHERE id = :id';
        $stmt = $this->db->prepare($query);
        return $stmt->execute(array(':id' => $id));
    }
}
