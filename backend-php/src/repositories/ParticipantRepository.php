<?php

class ParticipantRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByCampId($camp_id) {
        $stmt = $this->db->prepare("
            SELECT p.*, r.tn_vorname, r.tn_familienname, r.tn_geburtsdatum,
                   r.tn_geschlecht, r.allergien, r.medikamente, r.schwimmer,
                   t.name as zelt_name
            FROM participants p
            LEFT JOIN registrations r ON p.registration_id = r.id
            LEFT JOIN tents t ON p.zelt_id = t.id
            WHERE p.camp_id = ?
            ORDER BY r.tn_familienname, r.tn_vorname
        ");
        return $this->db->execute($stmt, [$camp_id]);
    }

    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT p.*, r.*, t.name as zelt_name, u.vorname as checked_in_by_vorname, u.nachname as checked_in_by_nachname
            FROM participants p
            LEFT JOIN registrations r ON p.registration_id = r.id
            LEFT JOIN tents t ON p.zelt_id = t.id
            LEFT JOIN users u ON p.checked_in_by_id = u.id
            WHERE p.id = ?
        ");
        $result = $this->db->execute($stmt, [$id]);
        return $result[0] ?? null;
    }

    public function getByQRCode($qr_code) {
        // QR code typically contains participant ID
        $id = intval($qr_code);
        return $this->getById($id);
    }

    public function create($camp_id, $registration_id, $user_id = null) {
        $stmt = $this->db->prepare("
            INSERT INTO participants (camp_id, registration_id, user_id, status, created_at)
            VALUES (?, ?, ?, 'gesund', NOW())
        ");
        $this->db->execute($stmt, [$camp_id, $registration_id, $user_id]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $allowed = ['zelt_id', 'status', 'foto_url'];
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
        $stmt = $this->db->prepare("UPDATE participants SET " . implode(", ", $updates) . " WHERE id = ?");
        return $this->db->execute($stmt, $params);
    }

    public function checkIn($id, $checked_in_by_id) {
        $stmt = $this->db->prepare("
            UPDATE participants
            SET status = 'angekommen', check_in_time = NOW(), checked_in_by_id = ?
            WHERE id = ?
        ");
        return $this->db->execute($stmt, [$checked_in_by_id, $id]);
    }

    public function getCheckInStatus($camp_id) {
        $stmt = $this->db->prepare("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'angekommen' THEN 1 ELSE 0 END) as checked_in,
                SUM(CASE WHEN status != 'angekommen' THEN 1 ELSE 0 END) as pending
            FROM participants
            WHERE camp_id = ?
        ");
        $result = $this->db->execute($stmt, [$camp_id]);
        $data = $result[0];
        $data['percentage'] = $data['total'] > 0 ? round(($data['checked_in'] / $data['total']) * 100) : 0;
        return $data;
    }

    public function getCheckInList($camp_id) {
        $stmt = $this->db->prepare("
            SELECT p.id, p.status, p.check_in_time,
                   r.tn_vorname as name, r.tn_familienname as lastname,
                   CASE WHEN p.status = 'angekommen' THEN true ELSE false END as checked_in
            FROM participants p
            LEFT JOIN registrations r ON p.registration_id = r.id
            WHERE p.camp_id = ?
            ORDER BY r.tn_familienname, r.tn_vorname
        ");
        return $this->db->execute($stmt, [$camp_id]);
    }

    public function assignTent($participant_id, $tent_id) {
        $stmt = $this->db->prepare("UPDATE participants SET zelt_id = ? WHERE id = ?");
        return $this->db->execute($stmt, [$tent_id, $participant_id]);
    }

    public function getTentOccupancy($tent_id) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM participants WHERE zelt_id = ?
        ");
        $result = $this->db->execute($stmt, [$tent_id]);
        return $result[0]['count'] ?? 0;
    }
}
