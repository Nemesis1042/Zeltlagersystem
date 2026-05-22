<?php

class ActivityRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getByCampId($camp_id) {
        $stmt = $this->db->prepare("
            SELECT a.*, COUNT(ag.id) as num_groups
            FROM activities a
            LEFT JOIN activity_groups ag ON a.id = ag.activity_id
            WHERE a.camp_id = ?
            GROUP BY a.id
            ORDER BY a.name
        ");
        return $this->db->execute($stmt, [$camp_id]);
    }

    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT a.*, COUNT(ag.id) as num_groups
            FROM activities a
            LEFT JOIN activity_groups ag ON a.id = ag.activity_id
            WHERE a.id = ?
            GROUP BY a.id
        ");
        $result = $this->db->execute($stmt, [$id]);
        return $result[0] ?? null;
    }

    public function create($camp_id, $name, $description = '', $category = 'hobbygruppe', $location = '', $group_size = 10) {
        $stmt = $this->db->prepare("
            INSERT INTO activities (camp_id, name, description, category, location, group_size, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        $this->db->execute($stmt, [$camp_id, $name, $description, $category, $location, $group_size]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $allowed = ['name', 'description', 'category', 'location', 'group_size', 'fairness_score'];
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
        $stmt = $this->db->prepare("UPDATE activities SET " . implode(", ", $updates) . " WHERE id = ?");
        return $this->db->execute($stmt, $params);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM activity_group_members WHERE activity_group_id IN (SELECT id FROM activity_groups WHERE activity_id = ?)");
        $this->db->execute($stmt, [$id]);

        $stmt = $this->db->prepare("DELETE FROM activity_groups WHERE activity_id = ?");
        $this->db->execute($stmt, [$id]);

        $stmt = $this->db->prepare("DELETE FROM activities WHERE id = ?");
        return $this->db->execute($stmt, [$id]);
    }

    public function getGroups($activity_id) {
        $stmt = $this->db->prepare("
            SELECT ag.*, u.vorname as betreuer_vorname, u.nachname as betreuer_nachname,
                   COUNT(agm.id) as member_count
            FROM activity_groups ag
            LEFT JOIN users u ON ag.betreuer_id = u.id
            LEFT JOIN activity_group_members agm ON ag.id = agm.activity_group_id
            WHERE ag.activity_id = ?
            GROUP BY ag.id
            ORDER BY ag.group_number
        ");
        return $this->db->execute($stmt, [$activity_id]);
    }

    public function getGroupMembers($group_id) {
        $stmt = $this->db->prepare("
            SELECT agm.id, agm.attended, agm.notizen, p.id as participant_id,
                   r.tn_vorname, r.tn_familienname
            FROM activity_group_members agm
            LEFT JOIN participants p ON agm.participant_id = p.id
            LEFT JOIN registrations r ON p.registration_id = r.id
            WHERE agm.activity_group_id = ?
            ORDER BY r.tn_familienname, r.tn_vorname
        ");
        return $this->db->execute($stmt, [$group_id]);
    }

    public function createGroup($activity_id, $group_number, $betreuer_id = null) {
        $stmt = $this->db->prepare("
            INSERT INTO activity_groups (activity_id, group_number, betreuer_id, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        $this->db->execute($stmt, [$activity_id, $group_number, $betreuer_id]);
        return $this->db->lastInsertId();
    }

    public function addMemberToGroup($group_id, $participant_id) {
        $stmt = $this->db->prepare("
            INSERT INTO activity_group_members (activity_group_id, participant_id, created_at)
            VALUES (?, ?, NOW())
        ");
        return $this->db->execute($stmt, [$group_id, $participant_id]);
    }

    public function recordAttendance($group_id, $participant_id, $attended, $notizen = '') {
        $stmt = $this->db->prepare("
            UPDATE activity_group_members
            SET attended = ?, notizen = ?
            WHERE activity_group_id = ? AND participant_id = ?
        ");
        return $this->db->execute($stmt, [$attended ? 1 : 0, $notizen, $group_id, $participant_id]);
    }

    public function clearGroups($activity_id) {
        $stmt = $this->db->prepare("DELETE FROM activity_group_members WHERE activity_group_id IN (SELECT id FROM activity_groups WHERE activity_id = ?)");
        $this->db->execute($stmt, [$activity_id]);

        $stmt = $this->db->prepare("DELETE FROM activity_groups WHERE activity_id = ?");
        return $this->db->execute($stmt, [$activity_id]);
    }
}
