-- COMPLETE DATABASE RESET
-- Delete all tables and start fresh

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS activity_pairing_history;
DROP TABLE IF EXISTS activity_members;
DROP TABLE IF EXISTS activity_groups;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS auth_users;
DROP TABLE IF EXISTS camps;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS program_schedule;
DROP TABLE IF EXISTS rate_limits;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS smart_detect_logs;
DROP TABLE IF EXISTS tents;
DROP TABLE IF EXISTS tournament_team_players;
DROP TABLE IF EXISTS tournament_teams;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS transaction_items;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS pocket_money_accounts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS check_ins;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS=1;

-- Confirm all tables deleted
SELECT 'All tables deleted successfully!' as status;
