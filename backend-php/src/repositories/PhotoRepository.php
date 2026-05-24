<?php

class PhotoRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByCampId($camp_id) {
        $query = "
            SELECT p.*, u.vorname as uploaded_by_vorname, u.nachname as uploaded_by_nachname
            FROM photos p
            LEFT JOIN auth_users u ON p.uploaded_by_id = u.id
            WHERE p.camp_id = ?
            ORDER BY p.created_at DESC
        ";
        return $this->db->execute($query, [$camp_id])->fetchAll();
    }

    public function getReleasedPhotos($camp_id) {
        $query = "
            SELECT p.*, u.vorname as uploaded_by_vorname, u.nachname as uploaded_by_nachname
            FROM photos p
            LEFT JOIN auth_users u ON p.uploaded_by_id = u.id
            WHERE p.camp_id = ? AND p.released = true
            ORDER BY p.created_at DESC
        ";
        return $this->db->execute($query, [$camp_id])->fetchAll();
    }

    public function getById($id) {
        $query = "
            SELECT p.*, u.vorname as uploaded_by_vorname, u.nachname as uploaded_by_nachname
            FROM photos p
            LEFT JOIN auth_users u ON p.uploaded_by_id = u.id
            WHERE p.id = ?
        ";
        return $this->db->execute($query, [$id])->fetch();
    }

    public function create($camp_id, $filename, $description = '', $uploaded_by_id = null) {
        $query = "
            INSERT INTO photos (camp_id, filename, description, uploaded_by_id, released, created_at)
            VALUES (?, ?, ?, ?, false, NOW())
        ";
        $this->db->execute($query, [$camp_id, $filename, $description, $uploaded_by_id]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $allowed = ['description', 'released'];
        $updates = [];
        $params = [];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowed)) {
                $updates[] = "$key = ?";
                $params[] = $value;
            }
        }

        if (empty($updates)) return false;

        $params[] = $id;
        $query = "UPDATE photos SET " . implode(", ", $updates) . " WHERE id = ?";
        return $this->db->execute($query, $params);
    }

    public function delete($id) {
        $photo = $this->getById($id);
        if ($photo) {
            $filepath = __DIR__ . '/../../public/uploads/' . $photo['filename'];
            if (file_exists($filepath)) {
                unlink($filepath);
            }
        }

        $query = "DELETE FROM photos WHERE id = ?";
        return $this->db->execute($query, [$id]);
    }

    public function release($id, $released = true) {
        $query = "UPDATE photos SET released = ? WHERE id = ?";
        return $this->db->execute($query, [$released ? 1 : 0, $id]);
    }
}
