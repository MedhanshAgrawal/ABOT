const axios = require("axios");
const { BOT_TOKEN } = require("./config");
const {
    addSubscriber,
    removeSubscriber
} = require("./subscriber");

let offset = 0;

async function pollTelegram() {

    try {

        const res = await axios.get(
            `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`,
            {
                params: {
                    offset,
                    timeout: 30
                },
                timeout: 35000
            }
        );

        for (const update of res.data.result) {

            offset = update.update_id + 1;

            if (!update.message)
                continue;

            const chatId = update.message.chat.id;
            const text = (update.message.text || "").trim().toLowerCase();

            if (text === "/start") {

                addSubscriber(chatId);

                await axios.post(
                    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
                    {
                        chat_id: chatId,
                        text:
`🎉 Welcome!

You are now subscribed to Amazon India Job Alerts.

Commands:

/help - Help

/stop - Unsubscribe`
                    }
                );

            } else if (text === "/stop") {

                removeSubscriber(chatId);

                await axios.post(
                    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
                    {
                        chat_id: chatId,
                        text: "✅ You have been unsubscribed."
                    }
                );

            } else if (text === "/help") {

                await axios.post(
                    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
                    {
                        chat_id: chatId,
                        text:
`🤖 Amazon India Job Bot

/start - Subscribe

/stop - Unsubscribe

/help - Help`
                    }
                );

            }

        }

    } catch (err) {

        console.error(err.response?.data || err.message);

        // Small delay before retrying on errors
        await new Promise(resolve => setTimeout(resolve, 3000));

    }

}

async function startPolling() {

    console.log("🤖 Telegram Long Polling Started");

    while (true) {

        await pollTelegram();

    }

}

module.exports = {
    startPolling
};