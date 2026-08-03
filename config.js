require("dotenv").config();

module.exports = {

    // Telegram
    BOT_TOKEN: process.env.BOT_TOKEN,
    CHAT_ID: process.env.CHAT_ID,

    // Amazon Search
    MAX_PAGES: 2,

    // Preferred cities
    CITIES: [
        "Bengaluru",
        "Hyderabad",
        "Chennai",
        "Pune"
    ],

    // Roles to monitor
    ALLOWED_ROLES: [
        "software development engineer",
        "software dev engineer",
        "software engineer",
        "sde",
        "backend engineer",
        "backend developer",
        "frontend engineer",
        "frontend developer",
        "full stack engineer",
        "full stack developer",
        "platform engineer",
        "data engineer",
        "business intelligence engineer",
        "devops engineer",
        "cloud engineer"
    ],

    // Ignore these roles
    EXCLUDED_ROLES: [
        "scientist",
        "research scientist",
        "applied scientist",
        "digital associate",
        "data associate",
        "ai data associate",
        "ml data associate",
        "analyst",
        "financial",
        "finance",
        "account",
        "payroll",
        "manager",
        "program manager",
        "product manager",
        "technical program manager",
        "operations",
        "architect",
        "sap",
        "consultant",
        "support",
        "team lead",
        "category manager",
        "marketing",
        "sales",
        "hr",
        "intern",
        "principal",
        "staff",
        "lead",
        "senior",
        "sr."
    ]

};