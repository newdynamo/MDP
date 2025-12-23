const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

module.exports = {
    DATA_DIR,
    FUEL_DATA_FILE: path.join(DATA_DIR, 'fuel_data.json'),
    USERS_FILE: path.join(DATA_DIR, 'users.json'),
    FLEETS_FILE: path.join(DATA_DIR, 'fleets.json'),
    EU_DATA_FILE: path.join(DATA_DIR, 'eu_data.json'),
    EUA_MANUAL_FILE: path.join(DATA_DIR, 'eua_manual.json'),
    EUA_SHEET_CACHE_FILE: path.join(DATA_DIR, 'eua_sheet_cache.json'),
    CII_DATA_FILE: path.join(DATA_DIR, 'cii_data.json'),
    ACCESS_LOGS_FILE: path.join(DATA_DIR, 'access_logs.json'),
    USER_DATA_FILE: path.join(DATA_DIR, 'user_data.json'),
    TRADER_CONTACTS_FILE: path.join(DATA_DIR, 'trader_contacts.json'),
    ORDERS_FILE: path.join(DATA_DIR, 'orders.json'),
    TRADES_FILE: path.join(DATA_DIR, 'trades.json'),
    POOLS_FILE: path.join(DATA_DIR, 'pools.json'),
    EMAIL_CONFIG_FILE: path.join(DATA_DIR, 'email_config.json')
};
