const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { estimatedRideDurationHours } = require('../utils/Duration');
const { validatePincode } = require('../utils/validation');

exports.createBooking = async (req, res) => {
  const { vehicleId, fromPincode, toPincode, startTime, customerId } = req.body;
  if (!vehicleId || !fromPincode || !toPincode || !startTime || !customerId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!validatePincode(fromPincode)) {
    return res.status(400).json({ error: 'From pincode must be 5-6 digits' });
  }
  if (!validatePincode(toPincode)) {
    return res.status(400).json({ error: 'To pincode must be 5-6 digits' });
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

  const start = new Date(startTime);
  if (isNaN(start)) return res.status(400).json({ error: 'Invalid startTime' });

  const duration = estimatedRideDurationHours(fromPincode, toPincode);
  const end = new Date(start.getTime() + duration * 3600 * 1000);

  let session;
  try {
    session = await mongoose.startSession();
    try {
      session.startTransaction();

      const conflict = await Booking.exists({
        vehicleId: vehicle._id,
        $or: [
          { startTime: { $lt: end }, endTime: { $gt: start } }
        ]
      }).session(session);

      if (conflict) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({ error: 'Vehicle already booked for overlapping time' });
      }

      const booking = await Booking.create([{
        vehicleId: vehicle._id,
        fromPincode,
        toPincode,
        startTime: start,
        endTime: end,
        customerId,
        estimatedRideDurationHours: duration
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json(booking[0]);
    } catch (txErr) {
      try {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
      } catch (e) {}
      session.endSession();

      const conflict = await Booking.exists({
        vehicleId: vehicle._id,
        $or: [
          { startTime: { $lt: end }, endTime: { $gt: start } }
        ]
      });

      if (conflict) {
        return res.status(409).json({ error: 'Vehicle already booked for overlapping time' });
      }

      const booking = await Booking.create({
        vehicleId: vehicle._id,
        fromPincode,
        toPincode,
        startTime: start,
        endTime: end,
        customerId,
        estimatedRideDurationHours: duration
      });

      return res.status(201).json(booking);
    }
  } catch (err) {
    console.error(err);
    try { if (session) { await session.abortTransaction(); session.endSession(); } } catch (e) {}
    return res.status(500).json({ error: 'Internal error' });
  }
};

exports.listBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('vehicleId')
        .lean(),
      Booking.countDocuments()
    ]);

    return res.json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const b = await Booking.findById(id);
    if (!b) return res.status(404).json({ error: 'Booking not found' });
    await Booking.deleteOne({ _id: id });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
