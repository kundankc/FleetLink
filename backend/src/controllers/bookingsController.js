const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { estimatedRideDurationHours } = require('../utils/Duration');

exports.createBooking = async (req, res) => {
  const { vehicleId, fromPincode, toPincode, startTime, customerId } = req.body;
  if (!vehicleId || !fromPincode || !toPincode || !startTime || !customerId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

  const start = new Date(startTime);
  if (isNaN(start)) return res.status(400).json({ error: 'Invalid startTime' });

  const duration = estimatedRideDurationHours(fromPincode, toPincode);
  const end = new Date(start.getTime() + duration * 3600 * 1000);

  // Use a transaction to re-check and create atomically (best-effort)
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
      // Transactions may not be supported (e.g., in-memory MongoDB). Fall back to non-transactional check+create.
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
    const bookings = await Booking.find().populate('vehicleId').lean();
    return res.json(bookings);
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
