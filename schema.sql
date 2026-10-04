PRAGMA foreign_keys = ON;

-- ============================================
-- USERS
-- ============================================

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_user_id TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- ACCOUNTS
-- ============================================

CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,

    name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'IDR',

    is_active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE (user_id, name)
);


-- ============================================
-- CATEGORIES
-- ============================================

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,

    name TEXT NOT NULL,
    category_type TEXT NOT NULL,
    parent_id INTEGER,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (parent_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,

    UNIQUE (user_id, name)
);


-- ============================================
-- TRANSACTIONS
-- ============================================

CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,

    transaction_type TEXT NOT NULL,
    description TEXT,

    category_id INTEGER,

    transaction_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
);


-- ============================================
-- TRANSACTION ENTRIES
-- ============================================

CREATE TABLE transaction_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,

    amount INTEGER NOT NULL,
    unit TEXT NOT NULL DEFAULT 'IDR',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (transaction_id)
        REFERENCES transactions(id)
        ON DELETE CASCADE,

    FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE RESTRICT
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_accounts_user
    ON accounts(user_id);

CREATE INDEX idx_categories_user
    ON categories(user_id);

CREATE INDEX idx_transactions_user
    ON transactions(user_id);

CREATE INDEX idx_transactions_date
    ON transactions(transaction_date);

CREATE INDEX idx_transactions_category
    ON transactions(category_id);

CREATE INDEX idx_entries_transaction
    ON transaction_entries(transaction_id);

CREATE INDEX idx_entries_account
    ON transaction_entries(account_id);