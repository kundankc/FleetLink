const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  fromPincode: { type: String, required: true },
  toPincode: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  customerId: { type: String, required: true },
  estimatedRideDurationHours: { type: Number, required: true }
}, { timestamps: true });

BookingSchema.index({ vehicleId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
