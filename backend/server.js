const express = require('express');
const cors = require('cors');
const path = require('path');
const store = require('./models/store');
const emailService = require('./services/emailService');
const dataService = require('./services/dataService');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const tradingRoutes = require('./routes/tradingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const poolingRoutes = require('./routes/poolingRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

// --- Middlewares ---
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000'],
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Initialization & Start ---
(async () => {
    // 1. Load Data (File + Optional Mongo)
    await store.loadAll();

    // 2. Init Services
    emailService.init();

    // 3. Background Sync
    dataService.syncEUASheetData()
        .then(() => console.log("Initial EUA Sync Complete"))
        .catch(err => console.error("Initial EUA Sync Failed", err));

    // --- Routes Mounting ---
    app.use('/api/auth', authRoutes);
    app.use('/api/trading', tradingRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/pooling', poolingRoutes);
    app.use('/api', apiRoutes);

    // --- Start Server ---
    app.listen(PORT, () => {
        console.log(`Co-Fleeter Backend running on port ${PORT}`);
        console.log(`Make sure to run frontend on http://localhost:3000 or open index.html`);
    });
})();
