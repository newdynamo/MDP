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

    // --- SPA Fallback for Frontend Routing ---
    app.get('*', (req, res) => {
        // Only serve dashboard.html for undefined GET requests that don't look like static assets
        if (!req.url.startsWith('/api') && !req.url.includes('.')) {
            res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
        } else {
            res.status(404).send('Not Found');
        }
    });

    // --- System Graceful Shutdown Endpoint for stop.bat ---
    app.post('/api/system/shutdown', (req, res) => {
        res.json({ success: true, message: 'Shutting down safely...' });
        console.log('\n[System] Shutdown requested via API endpoint.');
        setTimeout(shutdown, 500); // Give time for response to flush
    });

    // --- Start Server ---
    const server = app.listen(PORT, () => {
        console.log(`Co-Fleeter Backend running on port ${PORT}`);
        console.log(`Make sure to run frontend on http://localhost:3000 or open index.html`);
    });

    // --- Graceful Shutdown Handler ---
    const shutdown = () => {
        console.log('\n[System] Shutdown signal received. Saving all data to disk...');
        try {
            if (store.save) {
                // Ensure all in-memory data caches are flushed to disk before quitting.
                store.save.users();
                store.save.fleets();
                store.save.fuelData();
                store.save.euData();
                store.save.ciiData();
                store.save.euaManual();
                store.save.userData();
                store.save.traderContacts();
                store.save.trading();
                store.save.pools();
                store.save.emailConfig();
            }
            console.log('[System] All data saved successfully. Server stopping now.');
        } catch (error) {
            console.error('[System] Error saving data on shutdown:', error);
        }

        server.close(() => {
            console.log('[System] Connections closed.');
            process.exit(0);
        });
    };

    // Listen for stop signals (e.g. Ctrl+C in terminal)
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
})();
