<?php

class CampRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll() {
        $query = "SELECT id, name, date_start as start_date, date_end as end_date, max_participants, location, theme as description, gebuehr_betrag as fee, active, created_at FROM camps ORDER BY date_start DESC";
        $stmt = $this->db->execute($query, []);
        return $this->formatResults($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function getById($id) {
        $query = "SELECT id, name, date_start as start_date, date_end as end_date, max_participants, location, theme as description, gebuehr_betrag as fee, active, created_at FROM camps WHERE id = ?";
        $stmt = $this->db->execute($query, [$id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? $this->formatRecord($result) : null;
    }

    public function create($name, $start_date, $end_date, $max_participants = 50, $location = '', $description = '', $fee = 0, $status = 'active') {
        $active = $status === 'inactive' ? false : true;
        $query = "INSERT INTO camps (name, date_start, date_end, max_participants, location, theme, gebuehr_betrag, active, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->db->execute($query, [
            $name,
            $start_date,
            $end_date,
            $max_participants,
            $location,
            $description,
            $fee,
            $active
        ]);

        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $dbFieldMap = [
            'name' => 'name',
            'start_date' => 'date_start',
            'end_date' => 'date_end',
            'max_participants' => 'max_participants',
            'location' => 'location',
            'description' => 'theme',
            'fee' => 'gebuehr_betrag',
            'status' => 'active'
        ];

        $updates = [];
        $values = [];

        foreach ($data as $key => $value) {
            if (isset($dbFieldMap[$key])) {
                $dbField = $dbFieldMap[$key];
                if ($key === 'status') {
                    $value = $value !== 'inactive';
                }
                $updates[] = "$dbField = ?";
                $values[] = $value;
            }
        }

        if (empty($updates)) {
            return false;
        }

        $values[] = $id;
        $query = "UPDATE camps SET " . implode(', ', $updates) . " WHERE id = ?";

        $stmt = $this->db->execute($query, $values);
        return $stmt->rowCount() > 0;
    }

    public function delete($id) {
        $query = "DELETE FROM camps WHERE id = ?";
        $stmt = $this->db->execute($query, [$id]);
        return $stmt->rowCount() > 0;
    }

    public function getActive() {
        $query = "SELECT id, name, date_start as start_date, date_end as end_date, max_participants, location, theme as description, gebuehr_betrag as fee, active, created_at FROM camps WHERE active = true ORDER BY date_start ASC";
        $stmt = $this->db->execute($query, []);
        return $this->formatResults($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public function getParticipantCount($camp_id) {
        $query = "SELECT COUNT(*) as count FROM participants WHERE camp_id = ?";
        $stmt = $this->db->execute($query, [$camp_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'] ?? 0;
    }

    private function formatRecord($record) {
        return [
            'id' => $record['id'],
            'name' => $record['name'],
            'start_date' => $record['start_date'],
            'end_date' => $record['end_date'],
            'max_participants' => (int)$record['max_participants'],
            'location' => $record['location'],
            'description' => $record['description'],
            'fee' => (float)$record['fee'],
            'status' => $record['active'] ? 'active' : 'inactive',
            'created_at' => $record['created_at']
        ];
    }

    private function formatResults($records) {
        return array_map([$this, 'formatRecord'], $records);
    }
}
?>
