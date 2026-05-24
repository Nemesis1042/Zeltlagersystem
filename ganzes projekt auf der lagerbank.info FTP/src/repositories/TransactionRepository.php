<?php

class TransactionRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getById($id) {
        $query = "SELECT t.*, p.tn_vorname, p.tn_familienname FROM transactions t
                  LEFT JOIN participants p ON t.participant_id = p.id
                  WHERE t.id = ?";
        $stmt = $this->db->execute($query, [$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByCampId($camp_id) {
        $query = "SELECT t.*, p.tn_vorname, p.tn_familienname FROM transactions t
                  LEFT JOIN participants p ON t.participant_id = p.id
                  LEFT JOIN pocket_money_accounts pma ON t.account_id = pma.id
                  WHERE pma.id IN (
                    SELECT pma2.id FROM pocket_money_accounts pma2
                    JOIN participants p2 ON pma2.participant_id = p2.id
                    WHERE p2.camp_id = ?
                  ) OR t.participant_id IN (
                    SELECT id FROM participants WHERE camp_id = ?
                  )
                  ORDER BY t.created_at DESC";
        $stmt = $this->db->execute($query, [$camp_id, $camp_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?? [];
    }

    public function create($participant_id, $product_name, $amount, $description = '', $ma_user_id = null) {
        // Get or create pocket money account
        $accountQuery = "SELECT id FROM pocket_money_accounts WHERE participant_id = ?";
        $accountStmt = $this->db->execute($accountQuery, [$participant_id]);
        $account = $accountStmt->fetch(PDO::FETCH_ASSOC);

        if (!$account) {
            // Create account if it doesn't exist
            $createAccountQuery = "INSERT INTO pocket_money_accounts (participant_id, initial_balance, current_balance, created_at)
                                   VALUES (?, 0, 0, NOW())";
            $this->db->execute($createAccountQuery, [$participant_id]);
            $account_id = $this->db->lastInsertId();
        } else {
            $account_id = $account['id'];
        }

        // Create transaction
        $query = "INSERT INTO transactions (participant_id, account_id, product_name, amount, description, ma_user_id, synced, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, true, NOW())";

        $stmt = $this->db->execute($query, [
            $participant_id,
            $account_id,
            $product_name,
            $amount,
            $description,
            $ma_user_id
        ]);

        $transaction_id = $this->db->lastInsertId();

        // Update account balance
        $updateQuery = "UPDATE pocket_money_accounts
                       SET current_balance = current_balance + ?
                       WHERE id = ?";
        $this->db->execute($updateQuery, [$amount, $account_id]);

        return $transaction_id;
    }

    public function getByParticipantId($participant_id) {
        $query = "SELECT * FROM transactions WHERE participant_id = ? ORDER BY created_at DESC";
        $stmt = $this->db->execute($query, [$participant_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?? [];
    }

    public function getByAccountId($account_id) {
        $query = "SELECT * FROM transactions WHERE account_id = ? ORDER BY created_at DESC";
        $stmt = $this->db->execute($query, [$account_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?? [];
    }
}
?>
