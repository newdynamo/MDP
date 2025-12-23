const { db, save } = require('../models/store');
const dataService = require('../services/dataService');

exports.getFleets = (req, res) => {
    const { userId, role } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    if (role === 'ADMIN') {
        let allFleets = [];
        Object.keys(db.fleets).forEach(ownerId => {
            const ships = db.fleets[ownerId].map(ship => ({ ...ship, ownerId }));
            allFleets = [...allFleets, ...ships];
        });
        return res.json(allFleets);
    } else {
        return res.json(db.fleets[userId] || []);
    }
};

exports.addShip = (req, res) => {
    const { userId, shipData } = req.body;
    if (!userId || !shipData) return res.status(400).json({ error: 'Invalid data' });

    if (!db.fleets[userId]) db.fleets[userId] = [];

    const newShip = {
        id: shipData.id || ('' + Math.floor(Math.random() * 10000000)),
        cii_rating: 'N/A',
        co2_ytd: 0,
        ...shipData
    };

    db.fleets[userId].push(newShip);
    save.fleets();
    res.json({ success: true, ship: newShip });
};

exports.batchAddShips = (req, res) => {
    const { userId, ships } = req.body;
    if (!userId || !Array.isArray(ships)) return res.status(400).json({ error: 'Invalid data' });

    if (!db.fleets[userId]) db.fleets[userId] = [];

    let count = 0;
    ships.forEach(s => {
        const exists = db.fleets[userId].find(f => f.id === s.id);
        if (!exists) {
            db.fleets[userId].push({
                cii_rating: 'N/A',
                co2_ytd: 0,
                ...s
            });
            count++;
        }
    });

    if (count > 0) save.fleets();
    res.json({ success: true, count });
};

exports.updateShip = (req, res) => {
    const shipId = req.params.id;
    const { userId, updateData } = req.body;

    if (!userId || !db.fleets[userId]) return res.status(400).json({ success: false });

    const shipIndex = db.fleets[userId].findIndex(s => s.id === shipId);
    if (shipIndex === -1) return res.status(404).json({ success: false });

    db.fleets[userId][shipIndex] = { ...db.fleets[userId][shipIndex], ...updateData };
    save.fleets();
    res.json({ success: true, ship: db.fleets[userId][shipIndex] });
};

exports.deleteShip = (req, res) => {
    const shipId = req.params.id;
    const userId = req.query.userId;

    if (!userId || !db.fleets[userId]) return res.status(404).json({ success: false });

    const initialLength = db.fleets[userId].length;
    db.fleets[userId] = db.fleets[userId].filter(s => s.id !== shipId);

    if (db.fleets[userId].length < initialLength) {
        save.fleets();
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: "Ship not found" });
    }
};

// --- CII & Reference Data ---

exports.getCiiConfigs = (req, res) => {
    res.json({
        constants: db.ciiConstants,
        fuels: db.fuelData,
        euData: db.euData
    });
};

exports.updateCiiConstants = (req, res) => {
    const { constants } = req.body;
    if (constants) {
        db.ciiConstants = constants;
        save.ciiData();
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
};

exports.refreshFuelData = (req, res) => {
    dataService.fetchFuelData(); // Async
    res.json({ success: true, message: "Refresh triggered" });
};

exports.getEuData = (req, res) => {
    res.json(db.euData);
};

exports.updateEuData = (req, res) => {
    const { newData } = req.body;
    try {
        if (newData) {
            db.euData = newData;
            save.euData();
            res.json({ success: true, message: 'EU Data updated' });
        } else {
            res.status(400).json({ success: false });
        }
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

exports.refreshEuData = (req, res) => {
    dataService.fetchEUData();
    res.json({ success: true, message: "EU Data Refresh triggered" });
};

exports.getUserCalculations = (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const data = db.userData[userId] || {};
    res.json({ success: true, calculations: data.calculations || [] });
};

exports.saveUserCalculation = (req, res) => {
    const { userId, calculation } = req.body;
    if (!userId || !calculation) return res.status(400).json({ error: 'Invalid data' });

    if (!db.userData[userId]) db.userData[userId] = { calculations: [] };

    db.userData[userId].calculations.unshift(calculation);
    if (db.userData[userId].calculations.length > 50) {
        db.userData[userId].calculations = db.userData[userId].calculations.slice(0, 50);
    }
    save.userData();
    res.json({ success: true });
};
