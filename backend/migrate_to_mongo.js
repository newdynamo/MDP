const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = "mongodb+srv://newdynamo_db_user:<YOUR_PASSWORD_HERE>@cluster0.eklart3.mongodb.net/";
const DATA_DIR = path.join(__dirname, 'data');

const GlobalDataSchema = new mongoose.Schema({ key: String, data: mongoose.Schema.Types.Mixed });
let GlobalData;

try {
    GlobalData = mongoose.model('GlobalData');
} catch {
    GlobalData = mongoose.model('GlobalData', GlobalDataSchema);
}

function safeRead(filename, defaultVal) {
    const fullPath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(fullPath)) return defaultVal;
    try {
        return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch {
        return defaultVal;
    }
}

async function run() {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    // Map local files to their MongoDB keys as defined in store.js parsing
    const migrations = [
        { key: 'users', file: 'users.json', default: [] },
        { key: 'fleets', file: 'fleets.json', default: {} },
        { key: 'fuelData', file: 'fuel_data.json', default: {} },
        { key: 'euData', file: 'eu_data.json', default: {} },
        { key: 'ciiConstants', file: 'cii_data.json', default: {} }, // store.js maps 'ciiConstants' but parses some of it. We'll upload whole for backup.
        { key: 'euaManualData', file: 'eua_manual.json', default: [] },
        { key: 'userData', file: 'user_data.json', default: {} },
        { key: 'traderContacts', file: 'trader_contacts.json', default: {} },
        { key: 'orders', file: 'orders.json', default: [] },
        { key: 'trades', file: 'trades.json', default: [] },
        { key: 'pools', file: 'pools.json', default: [] },
        { key: 'emailConfig', file: 'email_config.json', default: {} }
    ];

    for (const m of migrations) {
        console.log(`Reading local ${m.file}...`);
        const data = safeRead(m.file, null);
        
        if (data !== null) {
            console.log(`Uploading ${m.key} to MongoDB...`);
            await GlobalData.updateOne(
                { key: m.key },
                { key: m.key, data: data },
                { upsert: true }
            );
        } else {
            console.log(`Skipped ${m.file} (Not found or empty).`);
        }
    }

    console.log("Migration Complete!");
    process.exit(0);
}

run().catch(console.error);
