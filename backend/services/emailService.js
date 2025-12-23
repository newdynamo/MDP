const nodemailer = require('nodemailer');
const { db, save } = require('../models/store');

let transporter = null;

function init() {
    if (db.emailConfig.auth && db.emailConfig.auth.user && db.emailConfig.auth.pass) {
        try {
            transporter = nodemailer.createTransport(db.emailConfig);
            console.log("Email Service: Transporter Initialized.");
        } catch (e) {
            console.error("Email Service: Failed to init transporter", e);
        }
    }
}

function reload() {
    init();
}

function updateConfig(user, pass) {
    if (user) db.emailConfig.auth.user = user;
    if (pass && pass !== '********') db.emailConfig.auth.pass = pass;
    save.emailConfig();
    reload();
}

async function sendEmail(to, subject, text) {
    if (!transporter) {
        console.warn("Email Service: Transporter not ready. Cannot send mail.");
        return false;
    }

    if (!to) {
        console.warn("Email Service: No recipients.");
        return false;
    }

    const mailOptions = {
        from: db.emailConfig.auth.user,
        to: to, // string "a@a.com, b@b.com"
        subject: subject,
        text: text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email Sent:', info.response);
        return true;
    } catch (error) {
        console.error('Email Error:', error);
        return false;
    }
}

module.exports = {
    init,
    reload,
    updateConfig,
    sendEmail,
    get config() { return db.emailConfig; }
};
