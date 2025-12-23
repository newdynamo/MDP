const PERMISSIONS = {
    VIEW_ADMIN: 'VIEW_ADMIN',
    MANAGE_USERS: 'MANAGE_USERS',
    MANAGE_FLEET: 'MANAGE_FLEET',
    VIEW_CALCULATOR: 'VIEW_CALCULATOR',
    VIEW_MARKET: 'VIEW_MARKET',
    TRADE: 'TRADE',
    VIEW_REPORTS: 'VIEW_REPORTS'
};

const DEFAULT_ROLE_PERMISSIONS = {
    ADMIN: Object.values(PERMISSIONS),
    TRADER: [PERMISSIONS.VIEW_MARKET, PERMISSIONS.TRADE],
    USER: [PERMISSIONS.MANAGE_FLEET, PERMISSIONS.VIEW_CALCULATOR, PERMISSIONS.VIEW_MARKET, PERMISSIONS.VIEW_REPORTS]
};

const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1zyyZruglcI2f-JMMS45ou1QAcXjC37yPVw1b1J-C3Ds/export?format=csv";

// Initial CII Constants (can be overwritten by loaded data)
const INITIAL_CII_CONSTANTS = {
    CII_REF: {
        'Bulk Carrier': { a: 4745, c: 0.622, d: [0.86, 0.94, 1.06, 1.18] },
        'Gas Carrier': { a: 8104, c: 0.639, d: [0.81, 0.91, 1.12, 1.44] },
        'Tanker': { a: 5247, c: 0.610, d: [0.82, 0.93, 1.08, 1.28] },
        'Container': { a: 1984, c: 0.489, d: [0.83, 0.94, 1.07, 1.19] },
        'General Cargo': { a: 588, c: 0.3885, d: [0.86, 0.94, 1.06, 1.19] }
    },
    CII_REDUCTION: {
        '2019': 0, '2020': 1, '2021': 2, '2022': 3,
        '2023': 5, '2024': 7, '2025': 9, '2026': 11,
        '2027': 13.6, '2028': 16.3, '2029': 18.9, '2030': 21.5,
        '2031': 23.5, '2032': 25.5, '2033': 27.5, '2034': 29.5, '2035': 31.5,
        '2036': 33.5, '2037': 35.5, '2038': 37.5, '2039': 39.5, '2040': 41.5,
        '2041': 43.5, '2042': 45.5, '2043': 47.5, '2044': 49.5, '2045': 51.5,
        '2046': 53.5, '2047': 55.5, '2048': 57.5, '2049': 59.5, '2050': 61.5
    }
};

module.exports = {
    PERMISSIONS,
    DEFAULT_ROLE_PERMISSIONS,
    GOOGLE_SHEET_URL,
    INITIAL_CII_CONSTANTS
};
