const fs = require("fs");

const FILE = "./subscribers.json";

function loadSubscribers() {
    if (!fs.existsSync(FILE))
        return [];

    return JSON.parse(fs.readFileSync(FILE));
}

function saveSubscribers(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function addSubscriber(chatId) {

    const subs = loadSubscribers();

    if (!subs.includes(chatId)) {

        subs.push(chatId);

        saveSubscribers(subs);

        console.log(`New Subscriber ${chatId}`);

    }

}

function removeSubscriber(chatId) {

    const subs = loadSubscribers().filter(id => id !== chatId);

    saveSubscribers(subs);

}

module.exports = {
    loadSubscribers,
    addSubscriber,
    removeSubscriber
};