const allowedEmails = [
    "diyu301009@gmail.com"
];

function isAllowed(email) {
    return allowedEmails.includes(email.trim().toLowerCase());
}

module.exports = { isAllowed };
