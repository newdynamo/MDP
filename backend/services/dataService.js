const https = require('https');
const { db, save } = require('../models/store');
const { GOOGLE_SHEET_URL } = require('../config/constants');

// --- Helper: Fetch with Redirects ---
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const get = (currentUrl) => {
            https.get(currentUrl, (response) => {
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    get(response.headers.location);
                    return;
                }
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => resolve(data));
            }).on("error", reject);
        };
        get(url);
    });
}

// --- Fuel Data Sync ---
async function fetchFuelData() {
    const url = `https://docs.google.com/spreadsheets/d/17jCOPYQn8FypqiIu8ihPbVoxHEtTWLnjO1RAflpqWuM/export?format=csv&cache_buster=${Date.now()}`;
    try {
        const data = await fetchUrl(url);
        const rows = data.split('\n');
        const newFuelData = {};
        let currentClass = null;

        rows.forEach((row) => {
            const cols = row.split(',').map(c => c.trim());
            if (cols.length < 3) return;

            const fuelClass = cols[0];
            const name = cols[1];
            const cf = parseFloat(cols[2]);

            if (isNaN(cf)) return;
            if (fuelClass) currentClass = fuelClass;

            if (currentClass && name) {
                if (!newFuelData[currentClass]) newFuelData[currentClass] = [];
                newFuelData[currentClass].push({ name, cf });
            }
        });

        if (Object.keys(newFuelData).length > 0) {
            db.fuelData = newFuelData;
            save.fuelData();
            console.log(`DataService: Updated Fuel Data (${Object.keys(newFuelData).length} classes).`);
            return true;
        }
    } catch (e) {
        console.error("DataService: Error fetching Fuel CSV", e);
    }
    return false;
}

// --- EU Data Sync ---
async function fetchEUData() {
    const SHEET_ID = '1jDXSDFawzWrq2JrfXK0HmNaAYDa9YoEZSj7jpwvE--A';
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

    try {
        const data = await fetchUrl(url);
        const rows = data.split('\n').map(r => r.trim()).filter(r => r.length > 0);
        const newEUData = {};
        let currentCategory = "General";
        let headers = [];

        rows.forEach((row, i) => {
            const cols = [];
            let current = '';
            let inQuote = false;
            // Simple robust CSV parser
            for (let x = 0; x < row.length; x++) {
                const char = row[x];
                if (char === '"') {
                    inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                    cols.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                    current = '';
                    continue;
                }
                current += char;
            }
            cols.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

            if (i === 0) {
                headers = cols.map(h => h.trim());
                return;
            }

            if (cols.length >= 2) {
                // Heuristic to skip sub-headers if any
                if (cols[0].toLowerCase().includes('class') && cols[0].toLowerCase().includes('fuel')) return;

                const cat = cols[0];
                const name = cols[1];
                if (cat) currentCategory = cat;

                if (name) {
                    if (!newEUData[currentCategory]) newEUData[currentCategory] = [];
                    const item = { name };
                    for (let k = 2; k < cols.length; k++) {
                        let key = headers[k] || `Column_${k}`;
                        item[key] = cols[k] || '';
                    }
                    newEUData[currentCategory].push(item);
                }
            }
        });

        if (Object.keys(newEUData).length > 0) {
            db.euData = newEUData;
            save.euData();
            console.log(`DataService: Updated EU Data (${Object.keys(newEUData).length} categories).`);
            return true;
        }
    } catch (e) {
        console.error("DataService: Error fetching EU CSV", e);
    }
    return false;
}

// --- EUA Market Data Sync ---
async function syncEUASheetData() {
    console.log("DataService: Starting EUA Sheet Sync...");
    try {
        const data = await fetchUrl(GOOGLE_SHEET_URL);
        const rows = data.split('\n');
        let history = [];

        rows.forEach((row, index) => {
            if (index < 1) return;
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (!cols || cols.length < 2) return;

            const clean = (val) => val ? val.replace(/^"|"$/g, '').trim() : null;
            const dateStr = clean(cols[0]);
            const priceStr = clean(cols[1]);

            const dObj = new Date(dateStr);
            if (isNaN(dObj.getTime())) return;

            // YYYY-MM-DD
            const isoDate = dObj.toISOString().split('T')[0];
            const price = parseFloat(priceStr);

            if (!isNaN(price)) {
                history.push({
                    time: isoDate,
                    price: price,
                    vol: clean(cols[5]),
                    change: clean(cols[6])
                });
            }
        });

        history.sort((a, b) => new Date(a.time) - new Date(b.time));

        if (history.length > 0) {
            // Logic: Remove Manual Overrides if Sheet has data
            const sheetDates = new Set(history.map(h => h.time));
            const oldManualCount = db.euaManualData.length;
            db.euaManualData = db.euaManualData.filter(m => !sheetDates.has(m.date));
            if (db.euaManualData.length < oldManualCount) save.euaManual();

            db.euaSheetCache = history;
            save.euaSheet();
            console.log(`DataService: Synced ${history.length} EUA records.`);
            return history.length;
        }
    } catch (e) {
        console.error("DataService: Error syncing EUA Sheet", e);
    }
    return 0;
}

module.exports = {
    fetchFuelData,
    fetchEUData,
    syncEUASheetData
};
