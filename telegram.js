const axios = require("axios");
const { BOT_TOKEN, CHAT_ID } = require("./config");

function getJobAge(postedDate) {

    const posted = new Date(postedDate);

    if (isNaN(posted))
        return {
            age: "Unknown",
            badge: "⚪ UNKNOWN"
        };

    const diff = Date.now() - posted.getTime();

    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) {
        return {
            age: `${minutes} min`,
            badge: "🔴 JUST POSTED"
        };
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 6) {
        return {
            age: `${hours} hr`,
            badge: "🟡 RECENT"
        };
    }

    const days = Math.floor(hours / 24);

    return {
        age: `${days} day${days > 1 ? "s" : ""}`,
        badge: "🟢 OLDER"
    };

}

function buildMessage(job) {

    const detectedAt = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata"
    });

    const { age, badge } = getJobAge(job.postedRaw || job.posted);

    const templates = [

`${badge}

🚨 <b>Amazon India Job Alert</b>

💼 <b>${job.title}</b>

🆔 <b>Job ID:</b> ${job.id}

🏢 <b>Company:</b> Amazon

📍 <b>Location:</b> ${job.location}

📅 <b>Posted:</b> ${job.posted}

🕒 <b>Job Age:</b> ${age}

⏰ <b>Detected:</b> ${detectedAt}

<a href="${job.url}">🚀 Apply Now</a>`,

`${badge}

🔥 <b>New Amazon Opening!</b>

💼 <b>${job.title}</b>

🆔 ${job.id}

📍 ${job.location}

📅 ${job.posted}

🕒 ${age}

⏰ ${detectedAt}

👉 <a href="${job.url}">Apply Here</a>`,

`${badge}

🎯 <b>Matching Amazon Job Found</b>

💼 ${job.title}

🆔 Job ID: ${job.id}

📍 ${job.location}

📅 ${job.posted}

🕒 ${age}

⏰ ${detectedAt}

🚀 <a href="${job.url}">Open Job</a>`,

`${badge}

📢 <b>Amazon Careers Update</b>

<b>${job.title}</b>

🆔 ${job.id}

📍 ${job.location}

📅 ${job.posted}

🕒 ${age}

⏰ ${detectedAt}

🔗 <a href="${job.url}">View Job</a>`,

`${badge}

⚡ <b>Fresh Amazon Job Detected</b>

💼 ${job.title}

🆔 ${job.id}

📍 ${job.location}

📅 ${job.posted}

🕒 ${age}

⏰ ${detectedAt}

🚀 <a href="${job.url}">Apply Now</a>`,

`${badge}

🎉 <b>New Amazon Opportunity</b>

💼 <b>${job.title}</b>

🆔 ${job.id}

🏢 Amazon

📍 ${job.location}

📅 Posted: ${job.posted}

🕒 Age: ${age}

⏰ Found: ${detectedAt}

👇 <a href="${job.url}">Open Application</a>`

    ];

    return templates[Math.floor(Math.random() * templates.length)];

}

async function sendTelegram(job) {

    try {

        const response = await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                chat_id: CHAT_ID,
                text: buildMessage(job),
                parse_mode: "HTML",
                disable_web_page_preview: false
            }
        );

        console.log(`✅ Telegram sent for Job ID ${job.id}`);

        return response.data;

    } catch (err) {

        console.error("❌ Telegram Error:");
        console.error(err.response?.data || err.message);

    }

}

module.exports = {
    sendTelegram
};