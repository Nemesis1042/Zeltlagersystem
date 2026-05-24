<?php

class TentRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByCampId($camp_id) {
        $query = "
            SELECT t.*, COUNT(p.id) as occupancy
            FROM tents t
            LEFT JOIN participants p ON t.id = p.zelt_id
            WHERE t.camp_id = ?
            GROUP BY t.id
            ORDER BY t.name
        ";
        return $this->db->execute($query, [$camp_id])->fetchAll();
    }

    public function getById($id) {
        $query = "
            SELECT t.*, COUNT(p.id) as occupancy
            FROM tents t
            LEFT JOIN participants p ON t.id = p.zelt_id
            WHERE t.id = ?
            GROUP BY t.id
        ";
        return $this->db->execute($query, [$id])->fetch();
    }

    public function create($camp_id, $name, $capacity = 8) {
        $query = "
            INSERT INTO tents (camp_id, name, capacity, created_at)
            VALUES (?, ?, ?, NOW())
        ";
        $this->db->execute($query, [$camp_id, $name, $capacity]);
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
        $query = "UPDATE tents SET " . implode(", ", $updates) . " WHERE id = ?";
        return $this->db->execute($query, $params);
    }

    public function delete($id) {
        $query = "SELECT COUNT(*) as count FROM participants WHERE zelt_id = ?";
        $result = $this->db->execute($query, [$id])->fetch();
        if ($result['count'] > 0) {
            return false;
        }

        $query = "DELETE FROM tents WHERE id = ?";
        return $this->db->execute($query, [$id]);
    }

    public function assignParticipant($tent_id, $participant_id) {
        $tent = $this->getById($tent_id);
        if (!$tent) return false;

        if ($tent['occupancy'] >= $tent['capacity']) {
            return false;
        }

        $query = "UPDATE participants SET zelt_id = ? WHERE id = ?";
        return $this->db->execute($query, [$tent_id, $participant_id]);
    }

    public function getMembers($tent_id) {
        $query = "
            SELECT p.id, p.status, r.tn_vorname, r.tn_familienname,
                   r.tn_geburtsdatum
            FROM participants p
            LEFT JOIN registrations r ON p.registration_id = r.id
            WHERE p.zelt_id = ?
            ORDER BY r.tn_familienname, r.tn_vorname
        ";
        return $this->db->execute($query, [$tent_id])->fetchAll();
    }
}
