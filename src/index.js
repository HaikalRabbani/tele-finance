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
        const balances = await getBalance(
          env.finance_db,
          1,
          parsed.accountName || null
        );

        return Response.json({
          success: true,
          parsed,
          balances,
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

    return new Response("Finance Bot API");
  },
};