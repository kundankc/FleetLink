const express = require('express');
const router = express.Router();
const bookingsCtrl = require('../controllers/bookingsController');

router.post('/', bookingsCtrl.createBooking);
router.get('/', bookingsCtrl.listBookings);
router.delete('/:id', bookingsCtrl.deleteBooking);

module.exports = router;
