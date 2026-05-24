<?php

class PocketMoneyRepository {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAccountByParticipantId($participant_id) {
        $query = "SELECT * FROM pocket_money_accounts WHERE participant_id = ?";
        return $this->db->execute($query, [$participant_id])->fetch();
    }

    public function getAccountById($account_id) {
        $query = "SELECT * FROM pocket_money_accounts WHERE id = ?";
        return $this->db->execute($query, [$account_id])->fetch();
    }

    public function createAccount($participant_id, $initial_balance = 0) {
        $query = "
            INSERT INTO pocket_money_accounts (participant_id, balance, created_at)
            VALUES (?, ?, NOW())
        ";
        $this->db->execute($query, [$participant_id, $initial_balance]);
        return $this->db->lastInsertId();
    }

    public function addTransaction($account_id, $type, $amount, $description = '', $product_id = null) {
        $account = $this->getAccountById($account_id);
        if (!$account) {
            return false;
        }

        $new_balance = $type === 'income'
            ? $account['balance'] + $amount
            : $account['balance'] - $amount;

        $query = "
            INSERT INTO transactions (pocket_money_account_id, type, amount, description, product_id, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ";
        $this->db->execute($query, [$account_id, $type, $amount, $description, $product_id]);
        $transaction_id = $this->db->lastInsertId();

        $query = "UPDATE pocket_money_accounts SET balance = ? WHERE id = ?";
        $this->db->execute($query, [$new_balance, $account_id]);

        return $transaction_id;
    }

    public function getTransactions($account_id, $limit = 100) {
        $query = "
            SELECT * FROM transactions
            WHERE pocket_money_account_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        ";
        return $this->db->execute($query, [$account_id, $limit])->fetchAll();
    }

    public function getBalance($account_id) {
        $account = $this->getAccountById($account_id);
        return $account ? $account['balance'] : 0;
    }

    public function getAccountByCampId($camp_id) {
        $query = "
            SELECT pma.* FROM pocket_money_accounts pma
            JOIN participants p ON pma.participant_id = p.id
            WHERE p.camp_id = ?
            ORDER BY pma.created_at DESC
        ";
        return $this->db->execute($query, [$camp_id])->fetchAll();
    }

    public function getCampTotalBalance($camp_id) {
        $query = "
            SELECT SUM(pma.balance) as total FROM pocket_money_accounts pma
            JOIN participants p ON pma.participant_id = p.id
            WHERE p.camp_id = ?
        ";
        $result = $this->db->execute($query, [$camp_id])->fetch();
        return $result['total'] ?? 0;
    }
}
