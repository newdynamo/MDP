const { db, save } = require('../models/store');

function logAccess(user, ip) {
    const log = {
        userId: user.id || 'unknown',
        email: user.email,
        timestamp: Date.now(),
        ip: ip || 'unknown'
    };
    db.accessLogs.push(log);
    save.accessLogs();
}

/**
 * Returns visitor stats logic
 */
function getVisitorStats(period, date, startDate, endDate) {
    let filtered = db.accessLogs;

    if (period === 'day') {
        const targetStr = date || new Date().toISOString().split('T')[0];
        filtered = filtered.filter(l => {
            const d = new Date(l.timestamp).toISOString().split('T')[0];
            return d === targetStr;
        });
    } else if (period === 'month') {
        const targetStr = date || new Date().toISOString().slice(0, 7);
        filtered = filtered.filter(l => {
            const d = new Date(l.timestamp).toISOString().slice(0, 7);
            return d === targetStr;
        });
    } else if (period === 'custom' && startDate && endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime() + 86400000;
        filtered = filtered.filter(l => l.timestamp >= start && l.timestamp < end);
    }

    const totalLogins = filtered.length;
    const uniqueUsers = new Set(filtered.map(l => l.email)).size;

    const byDate = {};
    filtered.forEach(l => {
        const d = new Date(l.timestamp).toLocaleDateString();
        byDate[d] = (byDate[d] || 0) + 1;
    });

    return {
        period,
        totalLogins,
        uniqueUsers,
        breakdown: byDate
    };
}

module.exports = {
    logAccess,
    getVisitorStats
};
