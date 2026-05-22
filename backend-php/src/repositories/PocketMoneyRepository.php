<?php

class PocketMoneyRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAccountByParticipantId($participant_id) {
        $stmt = $this->db->prepare("
            SELECT * FROM pocket_money_accounts WHERE participant_id = ?
        ");
        $result = $this->db->execute($stmt, [$participant_id]);
        return $result[0] ?? null;
    }

    public function getAccountById($account_id) {
        $stmt = $this->db->prepare("
            SELECT * FROM pocket_money_accounts WHERE id = ?
        ");
        $result = $this->db->execute($stmt, [$account_id]);
        return $result[0] ?? null;
    }

    public function createAccount($participant_id, $initial_balance = 0) {
        $stmt = $this->db->prepare("
            INSERT INTO pocket_money_accounts (participant_id, balance, created_at)
            VALUES (?, ?, NOW())
        ");
        $this->db->execute($stmt, [$participant_id, $initial_balance]);
        return $this->db->lastInsertId();
    }

    public function addTransaction($account_id, $type, $amount, $description = '', $product_id = null) {
        // Calculate new balance
        $account = $this->getAccountById($account_id);
        if (!$account) {
            return false;
        }

        $new_balance = $type === 'income'
            ? $account['balance'] + $amount
            : $account['balance'] - $amount;

        // Add transaction
        $stmt = $this->db->prepare("
            INSERT INTO transactions (pocket_money_account_id, type, amount, description, product_id, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        $this->db->execute($stmt, [$account_id, $type, $amount, $description, $product_id]);
        $transaction_id = $this->db->lastInsertId();

        // Update account balance
        $stmt = $this->db->prepare("
            UPDATE pocket_money_accounts SET balance = ? WHERE id = ?
        ");
        $this->db->execute($stmt, [$new_balance, $account_id]);

        return $transaction_id;
    }

    public function getTransactions($account_id, $limit = 100) {
        $stmt = $this->db->prepare("
            SELECT * FROM transactions
            WHERE pocket_money_account_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        ");
        return $this->db->execute($stmt, [$account_id, $limit]);
    }

    public function getBalance($account_id) {
        $account = $this->getAccountById($account_id);
        return $account ? $account['balance'] : 0;
    }

    public function getAccountByCampId($camp_id) {
        $stmt = $this->db->prepare("
            SELECT pma.* FROM pocket_money_accounts pma
            JOIN participants p ON pma.participant_id = p.id
            WHERE p.camp_id = ?
            ORDER BY pma.created_at DESC
        ");
        return $this->db->execute($stmt, [$camp_id]);
    }

    public function getCampTotalBalance($camp_id) {
        $stmt = $this->db->prepare("
            SELECT SUM(pma.balance) as total FROM pocket_money_accounts pma
            JOIN participants p ON pma.participant_id = p.id
            WHERE p.camp_id = ?
        ");
        $result = $this->db->execute($stmt, [$camp_id]);
        return $result[0]['total'] ?? 0;
    }
}
