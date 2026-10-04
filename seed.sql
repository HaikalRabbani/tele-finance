PRAGMA foreign_keys = ON;

-- USER
INSERT INTO users (telegram_user_id, name)
VALUES ('test-user', 'Haikal');


-- ACCOUNTS
INSERT INTO accounts (user_id, name, account_type, currency)
SELECT id, 'Jago', 'BANK', 'IDR'
FROM users
WHERE telegram_user_id = 'test-user';

INSERT INTO accounts (user_id, name, account_type, currency)
SELECT id, 'SeaBank', 'BANK', 'IDR'
FROM users
WHERE telegram_user_id = 'test-user';

INSERT INTO accounts (user_id, name, account_type, currency)
SELECT id, 'DANA', 'EWALLET', 'IDR'
FROM users
WHERE telegram_user_id = 'test-user';


-- CATEGORY
INSERT INTO categories (user_id, name, category_type)
SELECT id, 'Food', 'EXPENSE'
FROM users
WHERE telegram_user_id = 'test-user';


-- =========================
-- OPENING BALANCE JAGO
-- =========================

INSERT INTO transactions (
    user_id,
    transaction_type,
    description,
    transaction_date
)
SELECT
    id,
    'OPENING_BALANCE',
    'Saldo awal Jago',
    DATE('now')
FROM users
WHERE telegram_user_id = 'test-user';

INSERT INTO transaction_entries (
    transaction_id,
    account_id,
    amount,
    unit
)
SELECT
    t.id,
    a.id,
    1000000,
    'IDR'
FROM transactions t
JOIN accounts a ON a.name = 'Jago'
WHERE t.description = 'Saldo awal Jago'
AND a.user_id = (
    SELECT id
    FROM users
    WHERE telegram_user_id = 'test-user'
);


-- =========================
-- OPENING BALANCE SEABANK
-- =========================

INSERT INTO transactions (
    user_id,
    transaction_type,
    description,
    transaction_date
)
SELECT
    id,
    'OPENING_BALANCE',
    'Saldo awal SeaBank',
    DATE('now')
FROM users
WHERE telegram_user_id = 'test-user';

INSERT INTO transaction_entries (
    transaction_id,
    account_id,
    amount,
    unit
)
SELECT
    t.id,
    a.id,
    2000000,
    'IDR'
FROM transactions t
JOIN accounts a ON a.name = 'SeaBank'
WHERE t.description = 'Saldo awal SeaBank'
AND a.user_id = (
    SELECT id
    FROM users
    WHERE telegram_user_id = 'test-user'
);


-- =========================
-- OPENING BALANCE DANA
-- =========================

INSERT INTO transactions (
    user_id,
    transaction_type,
    description,
    transaction_date
)
SELECT
    id,
    'OPENING_BALANCE',
    'Saldo awal DANA',
    DATE('now')
FROM users
WHERE telegram_user_id = 'test-user';

INSERT INTO transaction_entries (
    transaction_id,
    account_id,
    amount,
    unit
)
SELECT
    t.id,
    a.id,
    100000,
    'IDR'
FROM transactions t
JOIN accounts a ON a.name = 'DANA'
WHERE t.description = 'Saldo awal DANA'
AND a.user_id = (
    SELECT id
    FROM users
    WHERE telegram_user_id = 'test-user'
);


-- =========================
-- EXPENSE: NASI PADANG
-- =========================

INSERT INTO transactions (
    user_id,
    transaction_type,
    description,
    category_id,
    transaction_date
)
SELECT
    u.id,
    'EXPENSE',
    'Makan nasi padang',
    c.id,
    DATE('now')
FROM users u
JOIN categories c
    ON c.user_id = u.id
    AND c.name = 'Food'
WHERE u.telegram_user_id = 'test-user';

INSERT INTO transaction_entries (
    transaction_id,
    account_id,
    amount,
    unit
)
SELECT
    t.id,
    a.id,
    -25000,
    'IDR'
FROM transactions t
JOIN accounts a ON a.name = 'Jago'
WHERE t.description = 'Makan nasi padang'
AND a.user_id = (
    SELECT id
    FROM users
    WHERE telegram_user_id = 'test-user'
);