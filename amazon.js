const axios = require("axios");

const API = "https://www.amazon.jobs/en/search.json";

const {
    ALLOWED_ROLES,
    EXCLUDED_ROLES,
    CITIES,
    MAX_PAGES
} = require("./config");

const EXCLUDED_LEVEL_REGEX = /\b(iii|iv|v|3|4|5)\b|senior|sr\.?|staff|principal|lead|manager/i;
async function fetchPage(offset) {

    const response = await axios.get(API, {

        params: {
            offset,
            result_limit: 100,
            sort: "recent",
            base_query: "",
            "normalized_country_code[]": "IND"
        },

        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36",
            Accept: "application/json"
        },

        timeout: 15000

    });

    return response.data.jobs || [];

}

async function getLatestJobs() {

    const uniqueJobs = new Map();

    try {

        let offset = 0;

        while (offset < MAX_PAGES * 100) {

            const jobs = await fetchPage(offset);

            console.log(`Fetched ${jobs.length} jobs (offset ${offset})`);

            if (jobs.length === 0)
                break;

            for (const job of jobs) {

                const title = (job.title || "").toLowerCase();

                const location = (job.location || "").toLowerCase();

                // Skip unwanted roles
                if (EXCLUDED_ROLES.some(role => title.includes(role)))
                    continue;

                // Keep only desired roles
                if (!ALLOWED_ROLES.some(role => title.includes(role)))
                    continue;

                // Skip SDE III / IV
                // Skip higher level roles
                if (EXCLUDED_LEVEL_REGEX.test(title))
                    continue;

                // Preferred cities only
                if (
                    CITIES.length &&
                    !CITIES.some(city => location.includes(city.toLowerCase()))
                )
                    continue;

                // Remove duplicates
                const key = job.job_path || `${job.title}-${job.location}`;

                if (uniqueJobs.has(key))
                    continue;

                uniqueJobs.set(key, {

                    id: job.id_icims,

                    title: job.title,

                    location: job.location,

                    city: job.city,

                    state: job.state,

                    country: job.country_code,

                    category: job.job_category,

                    posted: job.posted_date,
                    postedRaw: job.posted_date,

                    updated: job.updated_time,

                    url: `https://www.amazon.jobs${job.job_path}`

                });

            }

            offset += 100;

        }

        const result = [...uniqueJobs.values()];

        result.sort(
            (a, b) => new Date(b.posted) - new Date(a.posted)
        );

        console.log("\n========================================");
        console.log(`🎯 Matching Jobs : ${result.length}`);
        console.log("========================================\n");

        result.forEach(job => {

            console.log(`💼 ${job.title}`);
            console.log(`📍 ${job.location}`);
            console.log(`📅 ${job.posted}`);
            console.log(`🔗 ${job.url}`);
            console.log("");

        });

        return result;

    } catch (err) {

        console.error("Amazon API Error");

        console.error(err.response?.data || err.message);

        return [];

    }

}

module.exports = {
    getLatestJobs
};