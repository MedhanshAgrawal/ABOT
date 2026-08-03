const { getLatestJobs } = require("./amazon");
const { loadJobs, saveJobs } = require("./database");
const { sendTelegram } = require("./telegram");

(async () => {
    const latestJobs = await getLatestJobs();

    const oldJobs = loadJobs();

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

    saveJobs(oldJobs);

    console.log(`\n✅ ${newCount} new jobs found.`);
})();