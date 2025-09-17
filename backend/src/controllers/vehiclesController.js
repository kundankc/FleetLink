const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { estimatedRideDurationHours } = require('../utils/Duration');

exports.createVehicle = async (req, res) => {
  const { name, capacityKg, tyres } = req.body;
  if (!name || capacityKg == null || tyres == null) {
    return res.status(400).json({ error: 'name, capacityKg and tyres are required' });
  }
  try {
    const v = await Vehicle.create({ name, capacityKg, tyres });
    return res.status(201).json(v);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
};

exports.getAvailableVehicles = async (req, res) => {
  try {
    const { capacityRequired, fromPincode, toPincode, startTime } = req.query;
    console.debug('getAvailableVehicles called with', { capacityRequired, fromPincode, toPincode, startTime });
    if (!capacityRequired || !fromPincode || !toPincode || !startTime) {
      return res.status(400).json({ error: 'Missing query params' });
    }
    const capacity = Number(capacityRequired);
    const start = new Date(startTime);
    if (isNaN(start)) return res.status(400).json({ error: 'Invalid startTime' });

    let dur;
    try {
      dur = estimatedRideDurationHours(fromPincode, toPincode);
      console.debug('estimated duration', dur);
    } catch (e) {
      console.error('duration computation failed', e);
      return res.status(500).json({ error: 'Duration computation failed', details: e.message });
    }
    const end = new Date(start.getTime() + dur * 3600 * 1000);

    // find vehicles with enough capacity
    const vehicles = await Vehicle.find({ capacityKg: { $gte: capacity } }).lean();

    // for each vehicle check bookings overlap
    const available = [];
    for (const v of vehicles) {
      let conflict;
      try {
        conflict = await Booking.exists({
        vehicleId: v._id,
        $or: [
          { startTime: { $lt: end }, endTime: { $gt: start } }
        ]
        });
      } catch (e) {
        console.error('Booking.exists failed for vehicle', v._id, e);
        return res.status(500).json({ error: 'Booking lookup failed', details: e.message });
      }
      if (!conflict) {
        available.push({ ...v, estimatedRideDurationHours: dur });
      }
    }

    return res.json(available);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
