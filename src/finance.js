export async function getBalance(db, userId, accountName = null) {
  let query = `
    SELECT
      a.id,
      a.name,
      a.account_type,
      a.currency,
      COALESCE(SUM(te.amount), 0) AS balance
    FROM accounts a
    LEFT JOIN transaction_entries te
      ON te.account_id = a.id
    WHERE a.user_id = ?
      AND a.is_active = 1
  `;

  const params = [userId];

  if (accountName) {
    query += ` AND LOWER(a.name) = LOWER(?)`;
    params.push(accountName);
  }

  query += `
    GROUP BY
      a.id,
      a.name,
      a.account_type,
      a.currency
    ORDER BY a.id
  `;

  const result = await db
    .prepare(query)
    .bind(...params)
    .all();

  return result.results;
}

export async function createExpense(db, {
  userId,
  accountName,
  amount,
  categoryName,
  description,
}) {
  if (!amount || amount <= 0) {
    throw new Error("Amount harus lebih dari 0");
  }

  // Cari account
  const account = await db
    .prepare(`
      SELECT id, name
      FROM accounts
      WHERE user_id = ?
        AND LOWER(name) = LOWER(?)
        AND is_active = 1
      LIMIT 1
    `)
    .bind(userId, accountName)
    .first();

  if (!account) {
    throw new Error(`Account "${accountName}" tidak ditemukan`);
  }

  // Cari category
  const category = await db
    .prepare(`
      SELECT id, name
      FROM categories
      WHERE user_id = ?
        AND LOWER(name) = LOWER(?)
        AND category_type = 'EXPENSE'
      LIMIT 1
    `)
    .bind(userId, categoryName)
    .first();

  if (!category) {
    throw new Error(`Category "${categoryName}" tidak ditemukan`);
  }

  // Buat transaction
  const transaction = await db
    .prepare(`
      INSERT INTO transactions (
        user_id,
        transaction_type,
        description,
        category_id,
        transaction_date
      )
      VALUES (?, 'EXPENSE', ?, ?, DATE('now'))
      RETURNING id
    `)
    .bind(
      userId,
      description,
      category.id
    )
    .first();

  // Buat ledger entry
  await db
    .prepare(`
      INSERT INTO transaction_entries (
        transaction_id,
        account_id,
        amount,
        unit
      )
      VALUES (?, ?, ?, 'IDR')
    `)
    .bind(
      transaction.id,
      account.id,
      -Math.abs(amount)
    )
    .run();

  return {
    transactionId: transaction.id,
    account: account.name,
    category: category.name,
    amount: -Math.abs(amount),
    description,
  };
}

export async function createIncome(db, {
  userId,
  accountName,
  amount,
  categoryName,
  description,
}) {
  if (!amount || amount <= 0) {
    throw new Error("Amount harus lebih dari 0");
  }

  // Cari account
  const account = await db
    .prepare(`
      SELECT id, name
      FROM accounts
      WHERE user_id = ?
        AND LOWER(name) = LOWER(?)
        AND is_active = 1
      LIMIT 1
    `)
    .bind(userId, accountName)
    .first();

  if (!account) {
    throw new Error(`Account "${accountName}" tidak ditemukan`);
  }

  // Cari category
  const category = await db
    .prepare(`
      SELECT id, name
      FROM categories
      WHERE user_id = ?
        AND LOWER(name) = LOWER(?)
        AND category_type = 'INCOME'
      LIMIT 1
    `)
    .bind(userId, categoryName)
    .first();

  if (!category) {
    throw new Error(`Category "${categoryName}" tidak ditemukan`);
  }

  // Buat transaction
  const transaction = await db
    .prepare(`
      INSERT INTO transactions (
        user_id,
        transaction_type,
        description,
        category_id,
        transaction_date
      )
      VALUES (?, 'INCOME', ?, ?, DATE('now'))
      RETURNING id
    `)
    .bind(
      userId,
      description,
      category.id
    )
    .first();

  // Buat ledger entry
  await db
    .prepare(`
      INSERT INTO transaction_entries (
        transaction_id,
        account_id,
        amount,
        unit
      )
      VALUES (?, ?, ?, 'IDR')
    `)
    .bind(
      transaction.id,
      account.id,
      Math.abs(amount)
    )
    .run();

  return {
    transactionId: transaction.id,
    account: account.name,
    category: category.name,
    amount: Math.abs(amount),
    description,
  };
}

export async function createTransfer(db, {
  userId,
  fromAccountName,
  toAccountName,
  amount,
  description = "Transfer",
}) {
  if (!amount || amount <= 0) {
    throw new Error("Amount harus lebih dari 0");
  }

  if (
    fromAccountName.toLowerCase() ===
    toAccountName.toLowerCase()
  ) {
    throw new Error("Account asal dan tujuan tidak boleh sama");
  }

  // Cari account asal
  const fromAccount = await db
    .prepare(`
      SELECT id, name
      FROM accounts
      WHERE user_id = ?
        AND LOWER(name) = LOWER(?)
        AND is_active = 1
      LIMIT 1
    `)
    .bind(userId, fromAccountName)
    .first();

  if (!fromAccount) {
    throw new Error(
      `Account asal "${fromAccountName}" tidak ditemukan`
    );
  }

  // Cari account tujuan
  const toAccount = await db
    .prepare(`
      SELECT id, name
      FROM accounts
      WHERE user_id = ?
        AND LOWER(name) = LOWER(?)
        AND is_active = 1
      LIMIT 1
    `)
    .bind(userId, toAccountName)
    .first();

  if (!toAccount) {
    throw new Error(
      `Account tujuan "${toAccountName}" tidak ditemukan`
    );
  }

  // Buat transaction
  const transaction = await db
    .prepare(`
      INSERT INTO transactions (
        user_id,
        transaction_type,
        description,
        transaction_date
      )
      VALUES (?, 'TRANSFER', ?, DATE('now'))
      RETURNING id
    `)
    .bind(
      userId,
      description
    )
    .first();

  // Kurangi account asal
  await db
    .prepare(`
      INSERT INTO transaction_entries (
        transaction_id,
        account_id,
        amount,
        unit
      )
      VALUES (?, ?, ?, 'IDR')
    `)
    .bind(
      transaction.id,
      fromAccount.id,
      -Math.abs(amount)
    )
    .run();

  // Tambahkan ke account tujuan
  await db
    .prepare(`
      INSERT INTO transaction_entries (
        transaction_id,
        account_id,
        amount,
        unit
      )
      VALUES (?, ?, ?, 'IDR')
    `)
    .bind(
      transaction.id,
      toAccount.id,
      Math.abs(amount)
    )
    .run();

  return {
    transactionId: transaction.id,
    from: fromAccount.name,
    to: toAccount.name,
    amount: Math.abs(amount),
    description,
  };
}

export async function getTotalBalance(db, userId) {
  const result = await db
    .prepare(`
      SELECT
        COALESCE(SUM(te.amount), 0) AS total_balance
      FROM accounts a
      LEFT JOIN transaction_entries te
        ON te.account_id = a.id
      WHERE a.user_id = ?
        AND a.is_active = 1
    `)
    .bind(userId)
    .first();

  return result.total_balance;
}