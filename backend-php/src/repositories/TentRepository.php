<?php

class TentRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByCampId($camp_id) {
        $stmt = $this->db->prepare("
            SELECT t.*, COUNT(p.id) as occupancy
            FROM tents t
            LEFT JOIN participants p ON t.id = p.zelt_id
            WHERE t.camp_id = ?
            GROUP BY t.id
            ORDER BY t.name
        ");
        return $this->db->execute($stmt, [$camp_id]);
    }

    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT t.*, COUNT(p.id) as occupancy
            FROM tents t
            LEFT JOIN participants p ON t.id = p.zelt_id
            WHERE t.id = ?
            GROUP BY t.id
        ");
        $result = $this->db->execute($stmt, [$id]);
        return $result[0] ?? null;
    }

    public function create($camp_id, $name, $capacity = 8) {
        $stmt = $this->db->prepare("
            INSERT INTO tents (camp_id, name, capacity, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        $this->db->execute($stmt, [$camp_id, $name, $capacity]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $allowed = ['name', 'capacity', 'color', 'icon', 'position_x', 'position_y'];
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
        $stmt = $this->db->prepare("UPDATE tents SET " . implode(", ", $updates) . " WHERE id = ?");
        return $this->db->execute($stmt, $params);
    }

    public function delete($id) {
        // Check if tent has occupants
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM participants WHERE zelt_id = ?");
        $result = $this->db->execute($stmt, [$id]);
        if ($result[0]['count'] > 0) {
            return false; // Cannot delete tent with occupants
        }

        $stmt = $this->db->prepare("DELETE FROM tents WHERE id = ?");
        return $this->db->execute($stmt, [$id]);
    }

    public function assignParticipant($tent_id, $participant_id) {
        $tent = $this->getById($tent_id);
        if (!$tent) return false;

        // Check capacity
        if ($tent['occupancy'] >= $tent['capacity']) {
            return false; // Tent full
        }

        $stmt = $this->db->prepare("UPDATE participants SET zelt_id = ? WHERE id = ?");
        return $this->db->execute($stmt, [$tent_id, $participant_id]);
    }

    public function getMembers($tent_id) {
        $stmt = $this->db->prepare("
            SELECT p.id, p.status, r.tn_vorname, r.tn_familienname,
                   r.tn_geburtsdatum, r.allergien, r.medikamente
            FROM participants p
            LEFT JOIN registrations r ON p.registration_id = r.id
            WHERE p.zelt_id = ?
            ORDER BY r.tn_familienname, r.tn_vorname
        ");
        return $this->db->execute($stmt, [$tent_id]);
    }
}
