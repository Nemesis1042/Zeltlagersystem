<?php

class UserRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function findByEmail($email) {
        $query = 'SELECT * FROM auth_users WHERE email = ?';
        return $this->db->execute($query, [$email])->fetch();
    }

    public function findById($id) {
        $query = 'SELECT * FROM auth_users WHERE id = ?';
        return $this->db->execute($query, [$id])->fetch();
    }

    public function getAll() {
        $query = 'SELECT id, email, vorname, nachname, role, created_at FROM auth_users ORDER BY created_at DESC';
        return $this->db->execute($query, [])->fetchAll();
    }

    public function create($data) {
        $query = 'INSERT INTO auth_users (email, password, vorname, nachname, role, created_at)
                  VALUES (?, ?, ?, ?, ?, NOW())';

        $this->db->execute($query, [
            $data['email'],
            $data['password_hash'],
            $data['vorname'],
            $data['nachname'],
            $data['role']
        ]);

        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $fields = [];
        $params = [];

        foreach ($data as $key => $value) {
            if ($key === 'password_hash') {
                $fields[] = 'password = ?';
            } else {
                $fields[] = $key . ' = ?';
            }
            $params[] = $value;
        }

        if (empty($fields)) return false;

        $params[] = $id;
        $query = 'UPDATE auth_users SET ' . implode(', ', $fields) . ' WHERE id = ?';
        return $this->db->execute($query, $params);
    }

    public function delete($id) {
        $query = 'DELETE FROM auth_users WHERE id = ?';
        return $this->db->execute($query, [$id]);
    }
}
