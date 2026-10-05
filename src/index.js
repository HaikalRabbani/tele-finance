import {
  getBalance,
  createExpense,
  createIncome,
  createTransfer,
  getTotalBalance,
  getOrCreateUser,
  getConversationState,
  setConversationState,
  clearConversationState,
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

    // =========================================================
    // BASIC TEST
    // =========================================================

    if (url.pathname === "/") {
      return new Response("Finance Bot API");
    }


    // =========================================================
    // TEST USER RESOLVER
    // =========================================================

    if (url.pathname === "/test/user") {
      const telegramUserId =
        url.searchParams.get("telegramUserId");

      if (!telegramUserId) {
        return Response.json(
          {
            success: false,
            error: "telegramUserId wajib diisi",
          },
          { status: 400 }
        );
      }

      const user = await getOrCreateUser(
        env.finance_db,
        telegramUserId,
        "Test User"
      );

      return Response.json({
        success: true,
        user,
      });
    }


    // =========================================================
    // TEST BALANCE
    // =========================================================

    if (url.pathname === "/test/balance") {
      const balances = await getBalance(
        env.finance_db,
        1
      );

      return Response.json({
        success: true,
        balances,
      });
    }


    // =========================================================
    // TEST BALANCE JAGO
    // =========================================================

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


    // =========================================================
    // TEST TOTAL BALANCE
    // =========================================================

    if (url.pathname === "/test/total") {
      const totalBalance =
        await getTotalBalance(
          env.finance_db,
          1
        );

      return Response.json({
        success: true,
        totalBalance,
        formatted: formatRupiah(
          totalBalance
        ),
      });
    }


    // =========================================================
    // TEST EXPENSE
    // =========================================================

    if (url.pathname === "/test/expense") {
      const result =
        await createExpense(
          env.finance_db,
          {
            userId: 1,
            accountName: "Jago",
            amount: 25000,
            categoryName: "Food",
            description: "Test expense",
          }
        );

      return Response.json({
        success: true,
        result,
      });
    }


    // =========================================================
    // TEST INCOME
    // =========================================================

    if (url.pathname === "/test/income") {
      const result =
        await createIncome(
          env.finance_db,
          {
            userId: 1,
            accountName: "SeaBank",
            amount: 1000000,
            categoryName: "Salary",
            description: "Test income",
          }
        );

      return Response.json({
        success: true,
        result,
      });
    }


    // =========================================================
    // TEST TRANSFER
    // =========================================================

    if (url.pathname === "/test/transfer") {
      const result =
        await createTransfer(
          env.finance_db,
          {
            userId: 1,
            fromAccountName: "SeaBank",
            toAccountName: "DANA",
            amount: 500000,
            description: "Test transfer",
          }
        );

      return Response.json({
        success: true,
        result,
      });
    }


    // =========================================================
    // TEST PARSER EXPENSE
    // =========================================================

    if (url.pathname === "/test/parser") {
      const message =
        url.searchParams.get("message") ||
        "makan nasi padang 25k dari jago";

      const result =
        parseExpense(message);

      return Response.json({
        success: true,
        message,
        result,
      });
    }


    // =========================================================
    // TEST PARSER INCOME
    // =========================================================

    if (url.pathname === "/test/parser-income") {
      const message =
        url.searchParams.get("message") ||
        "gaji 3jt masuk seabank";

      const result =
        parseIncome(message);

      return Response.json({
        success: true,
        message,
        result,
      });
    }


    // =========================================================
    // TEST PARSER TRANSFER
    // =========================================================

    if (
      url.pathname ===
      "/test/parser-transfer"
    ) {
      const message =
        url.searchParams.get("message") ||
        "transfer 500k dari seabank ke dana";

      const result =
        parseTransfer(message);

      return Response.json({
        success: true,
        message,
        result,
      });
    }


    // =========================================================
    // TEST ROUTER
    // =========================================================

    if (url.pathname === "/test/router") {
      const message =
        url.searchParams.get("message") ||
        "makan nasi padang 25k dari jago";

      const result =
        messageRouter(message);

      return Response.json({
        success: true,
        message,
        result,
      });
    }


    // =========================================================
    // TEST QUERY PARSER
    // =========================================================

    if (
      url.pathname ===
      "/test/parser-query"
    ) {
      const message =
        url.searchParams.get("message") ||
        "saldo gw berapa";

      const result =
        parseQuery(message);

      return Response.json({
        success: true,
        message,
        result,
      });
    }


    // =========================================================
    // TEST QUERY
    // =========================================================

    if (url.pathname === "/test/query") {
      const message =
        url.searchParams.get("message") ||
        "saldo gw berapa";

      const parsed =
        parseQuery(message);

      if (!parsed.success) {
        return Response.json({
          success: false,
          message,
          parsed,
        });
      }

      if (parsed.intent === "BALANCE") {
        const totalBalance =
          await getTotalBalance(
            env.finance_db,
            1
          );

        const response =
          formatBalanceResponse({
            intent: parsed.intent,
            totalBalance,
          });

        return Response.json({
          success: true,
          message,
          parsed,
          response,
        });
      }

      if (
        parsed.intent ===
        "BALANCE_ACCOUNT"
      ) {
        const balances =
          await getBalance(
            env.finance_db,
            1,
            parsed.accountName
          );

        const response =
          formatBalanceResponse({
            intent: parsed.intent,
            accountName:
              parsed.accountName,
            balances,
          });

        return Response.json({
          success: true,
          message,
          parsed,
          balances,
          response,
        });
      }

      return Response.json({
        success: true,
        message,
        parsed,
      });
    }


    // =========================================================
    // TEST MESSAGE
    // =========================================================

    if (url.pathname === "/test/message") {
      const message =
        url.searchParams.get("message") ||
        "makan nasi padang 25k dari jago";

      const parsed =
        messageRouter(message);

      if (!parsed.success) {
        return Response.json({
          success: false,
          parsed,
        });
      }

      if (parsed.intent === "EXPENSE") {
        await createExpense(
          env.finance_db,
          {
            userId: 1,
            accountName:
              parsed.accountName,
            amount:
              parsed.amount,
            categoryName:
              parsed.categoryName,
            description:
              parsed.description,
          }
        );

        const balances =
          await getBalance(
            env.finance_db,
            1,
            parsed.accountName
          );

        const account =
          balances[0];

        return Response.json({
          success: true,
          parsed,
          account,
          response:
            `Tercatat: ${parsed.description} — ` +
            `${formatRupiah(
              parsed.amount
            )} dari ${account.name}. ` +
            `Saldo: ${formatRupiah(
              account.balance
            )}`,
        });
      }

      return Response.json({
        success: true,
        parsed,
      });
    }


    // =========================================================
    // TEST MESSAGE INCOME
    // =========================================================

    if (
      url.pathname ===
      "/test/message-income"
    ) {
      const message =
        url.searchParams.get("message") ||
        "gaji 3jt masuk seabank";

      const parsed =
        messageRouter(message);

      if (!parsed.success) {
        return Response.json({
          success: false,
          parsed,
        });
      }

      if (parsed.intent === "INCOME") {
        if (!parsed.accountName) {
          return Response.json({
            success: true,
            parsed,
            message:
              "Account belum ditentukan",
          });
        }

        await createIncome(
          env.finance_db,
          {
            userId: 1,
            accountName:
              parsed.accountName,
            amount:
              parsed.amount,
            categoryName:
              parsed.categoryName,
            description:
              parsed.description,
          }
        );

        const balances =
          await getBalance(
            env.finance_db,
            1,
            parsed.accountName
          );

        const account =
          balances[0];

        return Response.json({
          success: true,
          parsed,
          account,
          response:
            `Pemasukan tercatat: ` +
            `${parsed.description} — ` +
            `${formatRupiah(
              parsed.amount
            )} masuk ke ${account.name}. ` +
            `Saldo: ${formatRupiah(
              account.balance
            )}`,
        });
      }

      return Response.json({
        success: true,
        parsed,
      });
    }


    // =========================================================
    // TEST MESSAGE TRANSFER
    // =========================================================

    if (
      url.pathname ===
      "/test/message-transfer"
    ) {
      const message =
        url.searchParams.get("message") ||
        "transfer 500k dari seabank ke dana";

      const parsed =
        messageRouter(message);

      if (!parsed.success) {
        return Response.json({
          success: false,
          parsed,
        });
      }

      if (parsed.intent === "TRANSFER") {
        await createTransfer(
          env.finance_db,
          {
            userId: 1,
            fromAccountName:
              parsed.fromAccountName,
            toAccountName:
              parsed.toAccountName,
            amount:
              parsed.amount,
            description:
              parsed.description,
          }
        );

        const balances =
          await getBalance(
            env.finance_db,
            1
          );

        const fromAccount =
          balances.find(
            (account) =>
              account.name.toLowerCase() ===
              parsed.fromAccountName.toLowerCase()
          );

        const toAccount =
          balances.find(
            (account) =>
              account.name.toLowerCase() ===
              parsed.toAccountName.toLowerCase()
          );

        return Response.json({
          success: true,
          parsed,
          fromAccount,
          toAccount,
          response:
            `Transfer tercatat: ` +
            `${fromAccount.name} → ` +
            `${toAccount.name}, ` +
            `${formatRupiah(
              parsed.amount
            )}`,
        });
      }

      return Response.json({
        success: true,
        parsed,
      });
    }


    // =========================================================
    // TELEGRAM WEBHOOK
    // =========================================================

    if (
      url.pathname ===
        "/telegram/webhook" &&
      request.method === "POST"
    ) {
      try {
        const update =
          await request.json();

        const message =
          update.message;

        if (!message?.text) {
          return Response.json({
            ok: true,
          });
        }

        const chatId =
          message.chat.id;

        const text =
          message.text;

        console.log(
          "Telegram message:",
          text
        );


        // =====================================================
        // RESOLVE TELEGRAM USER
        // =====================================================

        const telegramUserId =
          message.from?.id ?? chatId;

        const user =
          await getOrCreateUser(
            env.finance_db,
            telegramUserId,
            message.from?.first_name ||
              null
          );

        console.log(
          "Resolved user:",
          user
        );

        const userId =
          user.id;


        // =====================================================
        // CHECK CONVERSATION STATE
        // =====================================================

        const conversationState =
          await getConversationState(
            env.finance_db,
            userId
          );

        console.log(
          "Conversation state:",
          conversationState
        );


        // =====================================================
        // WAITING FOR INCOME ACCOUNT
        // =====================================================

        if (conversationState) {
          let payload;

          try {
            payload =
              JSON.parse(
                conversationState.payload
              );
          } catch (error) {
            console.error(
              "Invalid conversation payload:",
              error
            );

            await clearConversationState(
              env.finance_db,
              userId
            );

            await sendTelegramMessage(
              env.TELEGRAM_BOT_TOKEN,
              chatId,
              "❌ Data percakapan rusak. Silakan kirim transaksi lagi."
            );

            return Response.json({
              ok: true,
            });
          }


          if (
            conversationState.state ===
            "WAITING_INCOME_ACCOUNT"
          ) {
            const accountNameMap = {
              jago: "Jago",
              "bank jago": "Jago",
              seabank: "SeaBank",
              "sea bank": "SeaBank",
              dana: "DANA",
            };

            const normalizedText =
              text
                .trim()
                .toLowerCase();

            const accountName =
              accountNameMap[
                normalizedText
              ];

            if (!accountName) {
              await sendTelegramMessage(
                env.TELEGRAM_BOT_TOKEN,
                chatId,
                "❓ Akun tidak dikenali.\n\n" +
                "Pilih salah satu: Jago, SeaBank, atau DANA."
              );

              return Response.json({
                ok: true,
              });
            }


            // =================================================
            // CREATE INCOME FROM CONTEXT
            // =================================================

            await createIncome(
              env.finance_db,
              {
                userId,
                accountName,
                amount:
                  payload.amount,
                categoryName:
                  payload.categoryName,
                description:
                  payload.description,
              }
            );


            // =================================================
            // CLEAR CONTEXT
            // =================================================

            await clearConversationState(
              env.finance_db,
              userId
            );


            // =================================================
            // GET UPDATED BALANCE
            // =================================================

            const balances =
              await getBalance(
                env.finance_db,
                userId,
                accountName
              );

            const account =
              balances[0];


            // =================================================
            // SEND RESPONSE
            // =================================================

            await sendTelegramMessage(
              env.TELEGRAM_BOT_TOKEN,
              chatId,
              `✅ Pemasukan tercatat: ${payload.description} — ${formatRupiah(
                payload.amount
              )} masuk ke ${account.name}\n` +
              `💰 Saldo ${account.name}: ${formatRupiah(
                account.balance
              )}`
            );

            return Response.json({
              ok: true,
            });
          }
        }


        // =====================================================
        // PARSE NORMAL MESSAGE
        // =====================================================

        const parsed =
          messageRouter(text);

        console.log(
          "Parsed:",
          parsed
        );


        // =====================================================
        // PARSER ERROR
        // =====================================================

        if (!parsed.success) {
          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            chatId,
            "❓ " + parsed.error
          );

          return Response.json({
            ok: true,
          });
        }


        // =====================================================
        // BALANCE
        // =====================================================

        if (
          parsed.intent ===
          "BALANCE"
        ) {
          const totalBalance =
            await getTotalBalance(
              env.finance_db,
              userId
            );

          const response =
            formatBalanceResponse({
              intent:
                parsed.intent,
              totalBalance,
            });

          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            chatId,
            response
          );

          return Response.json({
            ok: true,
          });
        }


        // =====================================================
        // BALANCE ACCOUNT
        // =====================================================

        if (
          parsed.intent ===
          "BALANCE_ACCOUNT"
        ) {
          const balances =
            await getBalance(
              env.finance_db,
              userId,
              parsed.accountName
            );

          const response =
            formatBalanceResponse({
              intent:
                parsed.intent,
              accountName:
                parsed.accountName,
              balances,
            });

          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            chatId,
            response
          );

          return Response.json({
            ok: true,
          });
        }


        // =====================================================
        // EXPENSE
        // =====================================================

        if (
          parsed.intent ===
          "EXPENSE"
        ) {
          await createExpense(
            env.finance_db,
            {
              userId,
              accountName:
                parsed.accountName,
              amount:
                parsed.amount,
              categoryName:
                parsed.categoryName,
              description:
                parsed.description,
            }
          );

          const balances =
            await getBalance(
              env.finance_db,
              userId,
              parsed.accountName
            );

          const account =
            balances[0];

          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            chatId,
            `✅ Tercatat: ${parsed.description} — ${formatRupiah(
              parsed.amount
            )} dari ${account.name}\n` +
            `💰 Saldo ${account.name}: ${formatRupiah(
              account.balance
            )}`
          );

          return Response.json({
            ok: true,
          });
        }


        // =====================================================
        // INCOME
        // =====================================================

        if (
          parsed.intent ===
          "INCOME"
        ) {

          // ---------------------------------------------------
          // ACCOUNT BELUM DITENTUKAN
          // ---------------------------------------------------

          if (!parsed.accountName) {
            await setConversationState(
              env.finance_db,
              userId,
              "WAITING_INCOME_ACCOUNT",
              {
                amount:
                  parsed.amount,
                categoryName:
                  parsed.categoryName,
                description:
                  parsed.description,
              }
            );

            await sendTelegramMessage(
              env.TELEGRAM_BOT_TOKEN,
              chatId,
              `💬 Pemasukan ${formatRupiah(
                parsed.amount
              )} masuk ke akun mana?\n\n` +
              `Pilih: Jago, SeaBank, atau DANA`
            );

            return Response.json({
              ok: true,
            });
          }


          // ---------------------------------------------------
          // ACCOUNT SUDAH DITENTUKAN
          // ---------------------------------------------------

          await createIncome(
            env.finance_db,
            {
              userId,
              accountName:
                parsed.accountName,
              amount:
                parsed.amount,
              categoryName:
                parsed.categoryName,
              description:
                parsed.description,
            }
          );

          const balances =
            await getBalance(
              env.finance_db,
              userId,
              parsed.accountName
            );

          const account =
            balances[0];

          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            chatId,
            `✅ Pemasukan tercatat: ${parsed.description} — ${formatRupiah(
              parsed.amount
            )} masuk ke ${account.name}\n` +
            `💰 Saldo ${account.name}: ${formatRupiah(
              account.balance
            )}`
          );

          return Response.json({
            ok: true,
          });
        }


        // =====================================================
        // TRANSFER
        // =====================================================

        if (
          parsed.intent ===
          "TRANSFER"
        ) {
          await createTransfer(
            env.finance_db,
            {
              userId,
              fromAccountName:
                parsed.fromAccountName,
              toAccountName:
                parsed.toAccountName,
              amount:
                parsed.amount,
              description:
                parsed.description,
            }
          );

          const balances =
            await getBalance(
              env.finance_db,
              userId
            );

          const fromAccount =
            balances.find(
              (account) =>
                account.name.toLowerCase() ===
                parsed.fromAccountName.toLowerCase()
            );

          const toAccount =
            balances.find(
              (account) =>
                account.name.toLowerCase() ===
                parsed.toAccountName.toLowerCase()
            );

          await sendTelegramMessage(
            env.TELEGRAM_BOT_TOKEN,
            chatId,
            `✅ Transfer tercatat\n` +
            `${fromAccount.name} → ${toAccount.name}\n` +
            `💸 ${formatRupiah(
              parsed.amount
            )}\n\n` +
            `💰 Saldo ${fromAccount.name}: ${formatRupiah(
              fromAccount.balance
            )}\n` +
            `💰 Saldo ${toAccount.name}: ${formatRupiah(
              toAccount.balance
            )}`
          );

          return Response.json({
            ok: true,
          });
        }


        // =====================================================
        // FALLBACK
        // =====================================================

        await sendTelegramMessage(
          env.TELEGRAM_BOT_TOKEN,
          chatId,
          "❓ Intent belum memiliki handler."
        );

        return Response.json({
          ok: true,
        });

      } catch (error) {
        console.error(
          "Webhook error:",
          error
        );

        try {
          const update =
            await request
              .clone()
              .json();

          const chatId =
            update.message?.chat?.id;

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

        return Response.json({
          ok: true,
        });
      }
    }


    // =========================================================
    // FALLBACK
    // =========================================================

    return new Response(
      "Finance Bot API"
    );
  },
};