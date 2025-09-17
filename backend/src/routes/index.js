const express = require('express');
const router = express.Router();

router.use('/vehicles', require('./vehicles'));
router.use('/bookings', require('./bookings'));

router.get('/', (req, res) => res.json({ ok: true }));

module.exports = router;
