const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const authController = require('../controllers/authController');

// Fleets
router.get('/data/fleets', dataController.getFleets);
router.post('/data/fleets', dataController.addShip);
router.post('/data/fleets/batch', dataController.batchAddShips);
router.put('/data/fleets/:id', dataController.updateShip);
router.delete('/data/fleets/:id', dataController.deleteShip);

// CII & Data configs
router.get('/data/cii-configurations', dataController.getCiiConfigs);
router.post('/data/cii-constants', dataController.updateCiiConstants);
router.post('/data/refresh-fuel-data', dataController.refreshFuelData);

// EU Data
router.get('/data/eu-data', dataController.getEuData);
router.post('/data/eu-data', dataController.updateEuData);
router.post('/data/refresh-eu-data', dataController.refreshEuData);

// User Profile / Data
router.post('/user/profile', authController.updateProfile); // Moved here to match /api/user/profile prefix if mounted at /api
router.get('/user/calculations', dataController.getUserCalculations);
router.post('/user/calculations', dataController.saveUserCalculation);

module.exports = router;
