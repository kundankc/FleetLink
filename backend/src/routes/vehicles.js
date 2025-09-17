const express = require('express');
const router = express.Router();
const vehiclesCtrl = require('../controllers/vehiclesController');

router.post('/', vehiclesCtrl.createVehicle);
router.get('/available', vehiclesCtrl.getAvailableVehicles);

module.exports = router;
