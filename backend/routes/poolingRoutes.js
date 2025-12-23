const express = require('express');
const router = express.Router();
const poolingController = require('../controllers/poolingController');

router.get('/', poolingController.getPools);
router.post('/', poolingController.createPool);
router.post('/join', poolingController.joinPool);
router.delete('/:id', poolingController.deletePool);

module.exports = router;
