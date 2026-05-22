<?php

class PhotoRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByCampId($camp_id) {
        $stmt = $this->db->prepare("
            SELECT p.*, u.vorname as uploaded_by_vorname, u.nachname as uploaded_by_nachname
            FROM photos p
            LEFT JOIN users u ON p.uploaded_by_id = u.id
            WHERE p.camp_id = ?
            ORDER BY p.created_at DESC
        ");
        return $this->db->execute($stmt, [$camp_id]);
    }

    public function getReleasedPhotos($camp_id) {
        $stmt = $this->db->prepare("
            SELECT p.*, u.vorname as uploaded_by_vorname, u.nachname as uploaded_by_nachname
            FROM photos p
            LEFT JOIN users u ON p.uploaded_by_id = u.id
            WHERE p.camp_id = ? AND p.released = true
            ORDER BY p.created_at DESC
        ");
        return $this->db->execute($stmt, [$camp_id]);
    }

    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT p.*, u.vorname as uploaded_by_vorname, u.nachname as uploaded_by_nachname
            FROM photos p
            LEFT JOIN users u ON p.uploaded_by_id = u.id
            WHERE p.id = ?
        ");
        $result = $this->db->execute($stmt, [$id]);
        return $result[0] ?? null;
    }

    public function create($camp_id, $filename, $description = '', $uploaded_by_id = null) {
        $stmt = $this->db->prepare("
            INSERT INTO photos (camp_id, filename, description, uploaded_by_id, released, created_at)
            VALUES (?, ?, ?, ?, false, NOW())
        ");
        $this->db->execute($stmt, [$camp_id, $filename, $description, $uploaded_by_id]);
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
        $stmt = $this->db->prepare("UPDATE photos SET " . implode(", ", $updates) . " WHERE id = ?");
        return $this->db->execute($stmt, $params);
    }

    public function delete($id) {
        // Get filename to delete file
        $photo = $this->getById($id);
        if ($photo) {
            $filepath = __DIR__ . '/../../public/uploads/' . $photo['filename'];
            if (file_exists($filepath)) {
                unlink($filepath);
            }
        }

        $stmt = $this->db->prepare("DELETE FROM photos WHERE id = ?");
        return $this->db->execute($stmt, [$id]);
    }

    public function release($id, $released = true) {
        $stmt = $this->db->prepare("UPDATE photos SET released = ? WHERE id = ?");
        return $this->db->execute($stmt, [$released ? 1 : 0, $id]);
    }
}
