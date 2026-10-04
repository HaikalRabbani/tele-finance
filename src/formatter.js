export function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBalanceResponse({
  intent,
  accountName,
  totalBalance,
  balances,
}) {
  if (intent === "BALANCE") {
    return `💰 Total saldo lu: ${formatRupiah(totalBalance)}`;
  }

  if (intent === "BALANCE_ACCOUNT") {
    if (!balances || balances.length === 0) {
      return `❌ Account "${accountName}" tidak ditemukan`;
    }

    const account = balances[0];

    return `💰 Saldo ${account.name}: ${formatRupiah(
      account.balance
    )}`;
  }

  return "❓ Query belum bisa ditampilkan.";
}