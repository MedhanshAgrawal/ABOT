const { sendTelegram } = require("./telegram");

(async () => {
    await sendTelegram({
        title: "Software Development Engineer I",
        location: "Bengaluru, Karnataka",
        country: "IND",
        posted: "Today",
        url: "https://www.amazon.jobs/"
    });
})();