const cron = require("node-cron");
const { getLatestJobs } = require("./amazon");
const { loadJobs, saveJobs } = require("./database");
const { sendTelegram } = require("./telegram");
const { startPolling } = require("./telegramCommands");

let isRunning = false;

async function checkJobs() {

    if (isRunning) {
        console.log("⏳ Previous check still running...");
        return;
    }

    isRunning = true;

    const start = Date.now();

    try {

        console.log("\n================================================");
        console.log(`🕒 ${new Date().toLocaleString()}`);
        console.log("🔍 Checking Amazon Jobs...");
        console.log("================================================");

        const latestJobs = await getLatestJobs();

        console.log(`📦 API returned ${latestJobs.length} jobs`);

        const oldJobs = loadJobs();

        // First run - save jobs only
        if (oldJobs.length === 0) {

            console.log("📥 First run detected.");
            console.log("📁 Saving current jobs without sending Telegram alerts.");

            saveJobs(
                latestJobs.map(job => ({
                    ...job,
                    detectedAt: new Date().toISOString()
                }))
            );

            console.log(`✅ Saved ${latestJobs.length} jobs.`);
            return;
        }

        // Use URL as unique key
        const knownJobs = new Set(oldJobs.map(job => job.url));

        let newCount = 0;

        for (const job of latestJobs) {

            if (knownJobs.has(job.url))
                continue;

            console.log(`🆕 ${job.title}`);

            try {

                await sendTelegram(job);

            } catch (err) {

                console.error("❌ Telegram send failed:", err.message);

            }

            oldJobs.push({
                ...job,
                detectedAt: new Date().toISOString()
            });

            knownJobs.add(job.url);

            newCount++;

        }

        // Keep only last 30 days
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

        const filteredJobs = oldJobs.filter(job =>
            Date.now() - new Date(job.detectedAt).getTime() < THIRTY_DAYS
        );

        saveJobs(filteredJobs);

        console.log(`🎉 ${newCount} new jobs found`);
        console.log(`⏱ Completed in ${((Date.now() - start) / 1000).toFixed(2)} sec`);

    } catch (err) {

        console.error("❌ Error");
        console.error(err);

    } finally {

        isRunning = false;

    }

}

(async () => {

    console.log("🚀 Amazon Job Monitor Started");

    // Start Telegram polling (runs forever in background)
    startPolling();

    console.log("🤖 Telegram Long Polling Started");

    // Run immediately
    await checkJobs();

    // Schedule every 5 minutes
    cron.schedule(
        "*/5 * * * *",
        checkJobs,
        {
            timezone: "Asia/Kolkata"
        }
    );

    console.log("⏰ Amazon scan scheduled every 5 minutes");

})();