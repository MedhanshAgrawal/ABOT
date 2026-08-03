const fs = require("fs");

const FILE = "./jobs.json";

function loadJobs() {
    if (!fs.existsSync(FILE))
        return [];

    return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function saveJobs(jobs) {
    fs.writeFileSync(FILE, JSON.stringify(jobs, null, 2));
}

module.exports = {
    loadJobs,
    saveJobs
};