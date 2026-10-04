import {
  getBalance,
  createExpense,
  createIncome,
  createTransfer,
  getTotalBalance,
} from "./finance.js";

import {
  parseExpense,
  parseIncome,
  parseTransfer,
  messageRouter,
  parseQuery,
} from "./parser.js";

import {
  formatRupiah,
  formatBalanceResponse,
} from "./formatter.js";

import { sendTelegramMessage } from "./telegram.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/test/balance") {
      const balances = await getBalance(env.finance_db, 1);

      return Response.json({
        success: true,
        balances,
      });
    }

    if (url.pathname === "/test/balance/jago") {
      const balances = await getBalance(
        env.finance_db,
        1,
        "Jago"
      );

      return Response.json({
        success: true,
        balances,
      });
    }

    if (url.pathname === "/test/expense") {
      try {
        const expense = await createExpense(env.finance_db, {
          userId: 1,
          accountName: "Jago",
          amount: 5000,
          categoryName: "Food",
          description: "Beli es teh",
        });

        return Response.json({
          success: true,
          expense,
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
    }

    if (url.pathname === "/test/income") {
      try {
        const income = await createIncome(env.finance_db, {
          userId: 1,
          accountName: "SeaBank",
          amount: 3000000,
          categoryName: "Salary",
          description: "Gaji",
        });

        return Response.json({
          success: true,
          income,
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
    }

    if (url.pathname === "/test/transfer") {
      try {
        const transfer = await createTransfer(env.finance_db, {
          userId: 1,
          fromAccountName: "SeaBank",
          toAccountName: "DANA",
          amount: 500000,
          description: "Transfer ke DANA",
        });

        return Response.json({
          success: true,
          transfer,
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
    }

    if (url.pathname === "/test/parser") {
        const message =
          url.searchParams.get("message") ||
          "makan nasi padang 25k dari jago";

        const result = parseExpense(message);

        return Response.json(result);
      }

      if (url.pathname === "/test/message") {
      const message =
        url.searchParams.get("message") ||
        "makan nasi padang 25k dari jago";

      const parsed = parseExpense(message);

      if (!parsed.success) {
        return Response.json(parsed, { status: 400 });
      }

      try {
        const expense = await createExpense(env.finance_db, {
          userId: 1,
          accountName: parsed.accountName,
          amount: parsed.amount,
          categoryName: parsed.categoryName,
          description: parsed.description,
        });

        return Response.json({
          success: true,
          parsed,
          expense,
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
    }

    if (url.pathname === "/test/parser-income") {
      const message =
        url.searchParams.get("message") ||
        "gaji 3jt masuk seabank";

      const result = parseIncome(message);

      return Response.json(result);
    }

    if (url.pathname === "/test/message-income") {
      const message =
        url.searchParams.get("message") ||
        "gaji 3jt masuk seabank";

      const parsed = parseIncome(message);

      if (!parsed.success) {
        return Response.json(parsed, { status: 400 });
      }

      try {
        const income = await createIncome(env.finance_db, {
          userId: 1,
          accountName: parsed.accountName,
          amount: parsed.amount,
          categoryName: parsed.categoryName,
          description: parsed.description,
        });

        return Response.json({
          success: true,
          parsed,
          income,
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
    }
    
    if (url.pathname === "/test/parser-transfer") {
      const message =
        url.searchParams.get("message") ||
        "transfer 500k dari seabank ke dana";

      const result = parseTransfer(message);

      return Response.json(result);
    }

    if (url.pathname === "/test/message-transfer") {
      const message =
        url.searchParams.get("message") ||
        "transfer 500k dari seabank ke dana";

      const parsed = parseTransfer(message);

      if (!parsed.success) {
        return Response.json(parsed, { status: 400 });
      }

      try {
        const transfer = await createTransfer(env.finance_db, {
          userId: 1,
          fromAccountName: parsed.fromAccountName,
          toAccountName: parsed.toAccountName,
          amount: parsed.amount,
          description: parsed.description,
        });

        return Response.json({
          success: true,
          parsed,
          transfer,
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
    }

    if (url.pathname === "/test/router") {
      const message =
        url.searchParams.get("message") ||
        "makan nasi padang 25k dari jago";

      const result = messageRouter(message);

      return Response.json(result);
    }

    if (url.pathname === "/test/parser-query") {
      const message =
        url.searchParams.get("message") ||
        "saldo gw berapa?";

      const result = parseQuery(message);

      return Response.json(result);
    }

    if (url.pathname === "/test/query") {
      const message =
        url.searchParams.get("message") ||
        "saldo gw berapa?";

      const parsed = parseQuery(message);

      if (!parsed.success) {
        return Response.json(parsed, { status: 400 });
      }

      try {
        if (parsed.intent === "BALANCE") {
          const totalBalance = await getTotalBalance(
            env.finance_db,
            1
          );

          const response = formatBalanceResponse({
            intent: parsed.intent,
            totalBalance,
          });

          return Response.json({
            success: true,
            message: response,
          });
        }

        const balances = await getBalance(
          env.finance_db,
          1,
          parsed.accountName
        );

        const response = formatBalanceResponse({
          intent: parsed.intent,
          accountName: parsed.accountName,
          balances,
        });

        return Response.json({
          success: true,
          message: response,
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
    }

    if (url.pathname === "/test/format") {
      const amount = Number(
        url.searchParams.get("amount") || 9045000
      );

      return Response.json({
        raw: amount,
        formatted: formatRupiah(amount),
      });
    }

    if (url.pathname === "/test/telegram") {
      const chatId = url.searchParams.get("chatId");
      const message =
        url.searchParams.get("message") ||
        "Test dari Finance Bot";

      if (!chatId) {
        return Response.json(
          {
            success: false,
            error: "chatId wajib diisi",
          },
          { status: 400 }
        );
      }

      try {
        const result = await sendTelegramMessage(
          env.TELEGRAM_BOT_TOKEN,
          chatId,
          message
        );

        return Response.json({
          success: true,
          telegram: result,
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
    }

    if (url.pathname === "/test/update") {
      const response = await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getUpdates`
      );

      const data = await response.json();

      return Response.json(data);
    }

    if (url.pathname === "/test/token") {
      return Response.json({
        hasToken: !!env.TELEGRAM_BOT_TOKEN,
      });
    }

    if (url.pathname === "/test/me") {
      const response = await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getMe`
      );

      const data = await response.json();

      return Response.json(data);
    }

    if (url.pathname === "/test/token-info") {
      const token = env.TELEGRAM_BOT_TOKEN || "";

      return Response.json({
        exists: !!token,
        length: token.length,
        hasColon: token.includes(":"),
        prefix: token.split(":")[0],
      });
    }


    if (url.pathname === "/telegram/webhook" && request.method === "POST") {
      try {
        const update = await request.json();

        const message = update.message;

        if (!message?.text) {
          return Response.json({ ok: true });
        }

        const chatId = message.chat.id;
        const text = message.text;

        console.log("Telegram message:", text);

        const parsed = messageRouter(text);

        console.log("Parsed:", parsed);

        if (!parsed.success) {
          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            chatId,
            "❓ " + parsed.error
          );

          return Response.json({ ok: true });
        }

        // =========================
        // BALANCE TOTAL
        // =========================
        if (parsed.intent === "BALANCE") {
          const totalBalance = await getTotalBalance(
            env.finance_db,
            1
          );

          const response = formatBalanceResponse({
            intent: parsed.intent,
            totalBalance,
          });

          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            chatId,
            response
          );

          return Response.json({ ok: true });
        }

        // =========================
        // BALANCE ACCOUNT
        // =========================
        if (parsed.intent === "BALANCE_ACCOUNT") {
          const balances = await getBalance(
            env.finance_db,
            1,
            parsed.accountName
          );

          const response = formatBalanceResponse({
            intent: parsed.intent,
            accountName: parsed.accountName,
            balances,
          });

          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            chatId,
            response
          );

          return Response.json({ ok: true });
        }

        // =========================
        // EXPENSE
        // =========================
        if (parsed.intent === "EXPENSE") {
          await createExpense(env.finance_db, {
            userId: 1,
            accountName: parsed.accountName,
            amount: parsed.amount,
            categoryName: parsed.categoryName,
            description: parsed.description,
          });

          const balances = await getBalance(
            env.finance_db,
            1,
            parsed.accountName
          );

          const account = balances[0];

          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            chatId,
            `✅ Tercatat: ${parsed.description} — ${formatRupiah(
              parsed.amount
            )} dari ${account.name}\n💰 Saldo ${
              account.name
            }: ${formatRupiah(account.balance)}`
          );

          return Response.json({ ok: true });
        }

        // =========================
        // INCOME
        // =========================
        if (parsed.intent === "INCOME") {
          await createIncome(env.finance_db, {
            userId: 1,
            accountName: parsed.accountName,
            amount: parsed.amount,
            categoryName: parsed.categoryName,
            description: parsed.description,
          });

          const balances = await getBalance(
            env.finance_db,
            1,
            parsed.accountName
          );

          const account = balances[0];

          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            chatId,
            `✅ Pemasukan tercatat: ${parsed.description} — ${formatRupiah(
              parsed.amount
            )} masuk ke ${account.name}\n💰 Saldo ${
              account.name
            }: ${formatRupiah(account.balance)}`
          );

          return Response.json({ ok: true });
        }

        // =========================
        // TRANSFER
        // =========================
        if (parsed.intent === "TRANSFER") {
          await createTransfer(env.finance_db, {
            userId: 1,
            fromAccountName: parsed.fromAccountName,
            toAccountName: parsed.toAccountName,
            amount: parsed.amount,
            description: parsed.description,
          });

          const balances = await getBalance(
            env.finance_db,
            1
          );

          const fromAccount = balances.find(
            (account) =>
              account.name.toLowerCase() ===
              parsed.fromAccountName.toLowerCase()
          );

          const toAccount = balances.find(
            (account) =>
              account.name.toLowerCase() ===
              parsed.toAccountName.toLowerCase()
          );

          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            chatId,
            `✅ Transfer tercatat\n` +
            `${fromAccount.name} → ${toAccount.name}\n` +
            `💸 ${formatRupiah(parsed.amount)}\n\n` +
            `💰 Saldo ${fromAccount.name}: ${formatRupiah(
              fromAccount.balance
            )}\n` +
            `💰 Saldo ${toAccount.name}: ${formatRupiah(
              toAccount.balance
            )}`
          );

          return Response.json({ ok: true });
        }

        // =========================
        // UNKNOWN INTENT
        // =========================
        await sendTelegramMessage(
          env.TELEGRAM_BOT_TOKEN,
          chatId,
          "❓ Intent belum memiliki handler."
        );

        return Response.json({ ok: true });

      } catch (error) {
        console.error("Webhook error:", error);

        try {
          const update = await request.clone().json();
          const chatId = update.message?.chat?.id;

          if (chatId) {
            await sendTelegramMessage(
              env.TELEGRAM_BOT_TOKEN,
              chatId,
              "❌ Terjadi error saat memproses pesan."
            );
          }
        } catch (telegramError) {
          console.error(
            "Failed to send error message:",
            telegramError
          );
        }

        return Response.json({ ok: true });
      }
    }



    return new Response("Finance Bot API");
  },
};