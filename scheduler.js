const cron = require("node-cron");
const { getLatestJobs } = require("./amazon");
const { loadJobs, saveJobs } = require("./database");
const { sendTelegram } = require("./telegram");

let isRunning = false;

async function checkJobs() {

    if (isRunning) {
        console.log("⏳ Previous check still running...");
        return;
    }

    isRunning = true;

    try {

        console.log("\n================================================");
        console.log(`🕒 ${new Date().toLocaleString()}`);
        console.log("🔍 Checking Amazon Jobs...");
        console.log("================================================");

        const latestJobs = await getLatestJobs();

        console.log(`📦 API returned ${latestJobs.length} jobs`);

        const oldJobs = loadJobs();

        // First run - just save existing jobs
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

        const knownIds = new Set(oldJobs.map(j => j.id));

        let newCount = 0;

        for (const job of latestJobs) {

            if (knownIds.has(job.id))
                continue;

            console.log(`🆕 ${job.title}`);

            await sendTelegram(job);

            oldJobs.push({
                ...job,
                detectedAt: new Date().toISOString()
            });

            knownIds.add(job.id);
            newCount++;
        }

        // Keep only last 30 days
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

        const filtered = oldJobs.filter(j =>
            Date.now() - new Date(j.detectedAt).getTime() < THIRTY_DAYS
        );

        saveJobs(filtered);

        console.log(`🎉 ${newCount} new jobs found`);

    } catch (err) {

        console.error("❌ Error");
        console.error(err);

    } finally {

        isRunning = false;

    }

}

// Run immediately when the app starts
checkJobs();

// Run every 5 minutes
cron.schedule(
    "*/5 * * * *",
    async () => {
        await checkJobs();
    },
    {
        timezone: "Asia/Kolkata"
    }
);
console.log("🚀 Amazon Job Monitor Started (Every 5 Minutes)");