export function parseExpense(message) {
  const text = message.trim();

  // =========================
  // AMOUNT
  // =========================

  const amountMatch = text.match(
    /(?:rp\s*)?(\d+(?:[.,]\d+)?)\s*(k|rb|ribu|jt|juta)?/i
  );

  if (!amountMatch) {
    return {
      success: false,
      error: "Nominal tidak ditemukan",
    };
  }

  let amount = Number(
    amountMatch[1].replace(",", ".")
  );

  const unit = amountMatch[2]?.toLowerCase();

  if (
    unit === "k" ||
    unit === "rb" ||
    unit === "ribu"
  ) {
    amount *= 1000;
  }

  if (
    unit === "jt" ||
    unit === "juta"
  ) {
    amount *= 1000000;
  }

  amount = Math.round(amount);

  // =========================
  // ACCOUNT
  // =========================

  const accountPatterns = [
    {
      name: "Jago",
      regex: /\b(?:jago|bank jago)\b/i,
    },
    {
      name: "SeaBank",
      regex: /\b(?:seabank|sea bank)\b/i,
    },
    {
      name: "DANA",
      regex: /\b(?:dana)\b/i,
    },
  ];

  let accountName = null;

  for (const account of accountPatterns) {
    if (account.regex.test(text)) {
      accountName = account.name;
      break;
    }
  }

  if (!accountName) {
    return {
      success: false,
      error: "Account tidak ditemukan",
    };
  }

  // =========================
  // DESCRIPTION
  // =========================

  let description = text
    .replace(amountMatch[0], "")
    .replace(
      /\b(?:dari|pakai|lewat)\b/gi,
      ""
    )
    .replace(
      /\b(?:jago|bank jago|seabank|sea bank|dana)\b/gi,
      ""
    )
    .trim();

  // =========================
  // CATEGORY
  // =========================

  let categoryName = "Other";

  if (
    /\b(makan|makanan|nasi|ayam|mie|bakso|padang)\b/i.test(
      description
    )
  ) {
    categoryName = "Food";
  }

  return {
    success: true,
    intent: "EXPENSE",
    amount,
    accountName,
    categoryName,
    description,
  };
}


export function parseIncome(message) {
  const text = message.trim();

  // =========================
  // AMOUNT
  // =========================

  const amountMatch = text.match(
    /(?:rp\s*)?(\d+(?:[.,]\d+)?)\s*(k|rb|ribu|jt|juta)?/i
  );

  if (!amountMatch) {
    return {
      success: false,
      error: "Nominal tidak ditemukan",
    };
  }

  let amount = Number(
    amountMatch[1].replace(",", ".")
  );

  const unit = amountMatch[2]?.toLowerCase();

  if (
    unit === "k" ||
    unit === "rb" ||
    unit === "ribu"
  ) {
    amount *= 1000;
  }

  if (
    unit === "jt" ||
    unit === "juta"
  ) {
    amount *= 1000000;
  }

  amount = Math.round(amount);

  // =========================
  // ACCOUNT
  // =========================

  const accountPatterns = [
    {
      name: "Jago",
      regex: /\b(?:jago|bank jago)\b/i,
    },
    {
      name: "SeaBank",
      regex: /\b(?:seabank|sea bank)\b/i,
    },
    {
      name: "DANA",
      regex: /\b(?:dana)\b/i,
    },
  ];

  let accountName = null;

  for (const account of accountPatterns) {
    if (account.regex.test(text)) {
      accountName = account.name;
      break;
    }
  }

  // =========================
  // DESCRIPTION
  // =========================

  let description = text
    .replace(amountMatch[0], "")
    .replace(
      /\b(?:masuk|ke|di|dari|pakai|lewat)\b/gi,
      ""
    )
    .replace(
      /\b(?:jago|bank jago|seabank|sea bank|dana)\b/gi,
      ""
    )
    .trim();

  // =========================
  // CATEGORY
  // =========================

  let categoryName = "Other";

  if (
    /\b(gaji|salary|payroll|upah)\b/i.test(
      description
    )
  ) {
    categoryName = "Salary";
  }

  return {
    success: true,
    intent: "INCOME",
    amount,
    accountName,
    categoryName,
    description,
  };
}


export function parseTransfer(message) {
  const text = message.trim();

  // =========================
  // AMOUNT
  // =========================

  const amountMatch = text.match(
    /(?:rp\s*)?(\d+(?:[.,]\d+)?)\s*(k|rb|ribu|jt|juta)?/i
  );

  if (!amountMatch) {
    return {
      success: false,
      error: "Nominal tidak ditemukan",
    };
  }

  let amount = Number(
    amountMatch[1].replace(",", ".")
  );

  const unit = amountMatch[2]?.toLowerCase();

  if (
    unit === "k" ||
    unit === "rb" ||
    unit === "ribu"
  ) {
    amount *= 1000;
  }

  if (
    unit === "jt" ||
    unit === "juta"
  ) {
    amount *= 1000000;
  }

  amount = Math.round(amount);

  // =========================
  // ACCOUNT
  // =========================

  const accountPatterns = [
    {
      name: "Jago",
      regex: /\b(?:jago|bank jago)\b/i,
    },
    {
      name: "SeaBank",
      regex: /\b(?:seabank|sea bank)\b/i,
    },
    {
      name: "DANA",
      regex: /\b(?:dana)\b/i,
    },
  ];

  const matchedAccounts = [];

  for (const account of accountPatterns) {
    if (account.regex.test(text)) {
      matchedAccounts.push(account.name);
    }
  }

  if (matchedAccounts.length < 2) {
    return {
      success: false,
      error:
        "Account asal dan tujuan tidak lengkap",
    };
  }

  // =========================
  // FROM / TO
  // =========================

  const fromToMatch = text.match(
    /\bdari\s+(jago|bank jago|seabank|sea bank|dana)\s+ke\s+(jago|bank jago|seabank|sea bank|dana)\b/i
  );

  let fromAccountName = null;
  let toAccountName = null;

  if (fromToMatch) {
    const normalizeAccount = (name) => {
      const lower =
        name.toLowerCase();

      if (
        lower === "jago" ||
        lower === "bank jago"
      ) {
        return "Jago";
      }

      if (
        lower === "seabank" ||
        lower === "sea bank"
      ) {
        return "SeaBank";
      }

      if (lower === "dana") {
        return "DANA";
      }

      return null;
    };

    fromAccountName =
      normalizeAccount(
        fromToMatch[1]
      );

    toAccountName =
      normalizeAccount(
        fromToMatch[2]
      );
  }

  if (
    !fromAccountName ||
    !toAccountName
  ) {
    return {
      success: false,
      error:
        "Format transfer harus menyebutkan dari dan ke",
    };
  }

  if (
    fromAccountName.toLowerCase() ===
    toAccountName.toLowerCase()
  ) {
    return {
      success: false,
      error:
        "Account asal dan tujuan tidak boleh sama",
    };
  }

  // =========================
  // DESCRIPTION
  // =========================

  let description = text
    .replace(amountMatch[0], "")
    .replace(
      /\btransfer\b/gi,
      ""
    )
    .replace(
      /\bdari\s+(jago|bank jago|seabank|sea bank|dana)\b/gi,
      ""
    )
    .replace(
      /\bke\s+(jago|bank jago|seabank|sea bank|dana)\b/gi,
      ""
    )
    .trim();

  if (!description) {
    description = "Transfer";
  }

  return {
    success: true,
    intent: "TRANSFER",
    amount,
    fromAccountName,
    toAccountName,
    description,
  };
}


export function messageRouter(message) {
  const text =
    message.trim().toLowerCase();

  if (!text) {
    return {
      success: false,
      error: "Pesan kosong",
    };
  }

  // =========================
  // QUERY
  // =========================

  if (
    /\b(saldo|balance)\b/i.test(text) ||
    /\b(yang|punya)\b.*\b(jago|seabank|dana)\b/i.test(
      text
    )
  ) {
    return parseQuery(message);
  }

  // =========================
  // TRANSFER
  // =========================

  if (
    /\btransfer\b/i.test(text) ||
    /\bpindah(?:kan)?\b/i.test(text)
  ) {
    return parseTransfer(message);
  }

  // =========================
  // INCOME
  // =========================

  if (
    /\b(gaji|salary|payroll|bonus|pendapatan|income|dapat|dapet)\b/i.test(
      text
    )
  ) {
    return parseIncome(message);
  }

  // =========================
  // EXPENSE
  // =========================

  if (
    /\b(makan|beli|bayar|jajan|pulsa|tagihan|ongkir)\b/i.test(
      text
    )
  ) {
    return parseExpense(message);
  }

  return {
    success: false,
    intent: "UNKNOWN",
    error:
      "Saya belum mengerti pesan tersebut",
  };
}


export function parseQuery(message) {
  const text = message.trim();

  if (!text) {
    return {
      success: false,
      error: "Pesan kosong",
    };
  }

  // =========================
  // ACCOUNT
  // =========================

  const accountPatterns = [
    {
      name: "Jago",
      regex: /\b(?:jago|bank jago)\b/i,
    },
    {
      name: "SeaBank",
      regex: /\b(?:seabank|sea bank)\b/i,
    },
    {
      name: "DANA",
      regex: /\b(?:dana)\b/i,
    },
  ];

  let accountName = null;

  for (const account of accountPatterns) {
    if (account.regex.test(text)) {
      accountName = account.name;
      break;
    }
  }

  // =========================
  // BALANCE QUERY
  // =========================

  if (
    /\b(saldo|balance)\b/i.test(text)
  ) {
    if (accountName) {
      return {
        success: true,
        intent: "BALANCE_ACCOUNT",
        accountName,
      };
    }

    return {
      success: true,
      intent: "BALANCE",
    };
  }

  // =========================
  // SIMPLE ACCOUNT QUERY
  // =========================

  if (
    accountName &&
    /\b(yang|punya|di|berapa)\b/i.test(text)
  ) {
    return {
      success: true,
      intent: "BALANCE_ACCOUNT",
      accountName,
    };
  }

  return {
    success: false,
    intent: "UNKNOWN_QUERY",
    error:
      "Query belum dikenali",
  };
}