<?php

class RegistrationRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getById($id) {
        $query = "SELECT * FROM registrations WHERE id = ?";
        return $this->db->execute($query, [$id])->fetch();
    }

    public function getByCampId($camp_id) {
        $query = "
            SELECT * FROM registrations
            WHERE camp_id = ?
            ORDER BY tn_familienname, tn_vorname
        ";
        return $this->db->execute($query, [$camp_id])->fetchAll();
    }

    public function create($camp_id, $data, $user_id = null) {
        $allowed = [
            'tn_familienname', 'tn_vorname', 'tn_strasse', 'tn_plz', 'tn_ort',
            'tn_geburtsdatum', 'tn_geschlecht', 'tn_telefon', 'tn_email', 'tn_konfession',
            'sorge_anrede', 'sorge_familienname', 'sorge_vorname', 'sorge_strasse',
            'sorge_plz', 'sorge_ort', 'sorge_telefon_festnetz', 'sorge_telefon_mobil',
            'sorge_email', 'sorge_beruf',
            'notfall_name', 'notfall_telefon', 'notfall_beziehung',
            'krankenkasse', 'versicherten_nr', 'kk_karte_mitgebracht', 'hausarztmodell', 'hausarzt',
            'allergien', 'vegetarier', 'vegan', 'kein_schweinefleisch', 'medikamente',
            'erkrankungen', 'besonderheiten',
            'schwimmer', 'schwimm_erlaubnis',
            'foto_einwilligung', 'rki_gelesen', 'gesundheit_bestaetigung', 'medikamente_gabe_erlaubnis'
        ];

        $fields = ['camp_id', 'user_id', 'status'];
        $values = [$camp_id, $user_id, 'angemeldet'];

        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $fields[] = $field;
                $values[] = $data[$field];
            }
        }

        $fields[] = 'created_at';
        $values[] = date('Y-m-d H:i:s');

        $placeholders = implode(',', array_fill(0, count($fields), '?'));
        $query = "
            INSERT INTO registrations (" . implode(',', $fields) . ")
            VALUES ($placeholders)
        ";
        $this->db->execute($query, $values);
        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $allowed = [
            'status', 'tn_familienname', 'tn_vorname', 'tn_strasse', 'tn_plz', 'tn_ort',
            'tn_geburtsdatum', 'tn_geschlecht', 'tn_telefon', 'tn_email', 'tn_konfession',
            'sorge_anrede', 'sorge_familienname', 'sorge_vorname', 'sorge_strasse',
            'sorge_plz', 'sorge_ort', 'sorge_telefon_festnetz', 'sorge_telefon_mobil',
            'sorge_email', 'sorge_beruf',
            'notfall_name', 'notfall_telefon', 'notfall_beziehung',
            'krankenkasse', 'versicherten_nr', 'kk_karte_mitgebracht', 'hausarztmodell', 'hausarzt',
            'allergien', 'vegetarier', 'vegan', 'kein_schweinefleisch', 'medikamente',
            'erkrankungen', 'besonderheiten',
            'schwimmer', 'schwimm_erlaubnis',
            'foto_einwilligung', 'rki_gelesen', 'gesundheit_bestaetigung', 'medikamente_gabe_erlaubnis',
            'gebuehr_bezahlt'
        ];

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
        $query = "UPDATE registrations SET " . implode(", ", $updates) . " WHERE id = ?";
        return $this->db->execute($query, $params);
    }

    public function delete($id) {
        $query = "DELETE FROM registrations WHERE id = ?";
        return $this->db->execute($query, [$id]);
    }

    public function getOrtByPlz($plz) {
        $query = "SELECT DISTINCT tn_ort FROM registrations WHERE tn_plz = ? LIMIT 1";
        $result = $this->db->execute($query, [$plz])->fetch();
        return $result['tn_ort'] ?? null;
    }
}
