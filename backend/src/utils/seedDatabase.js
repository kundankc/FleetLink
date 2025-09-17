const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { estimatedRideDurationHours } = require('../utils/Duration');

async function seedDatabase() {
  console.log('Checking if database needs seeding...');
  
  const vehicleCount = await Vehicle.countDocuments();
  if (vehicleCount > 0) {
    console.log('Database already has data, skipping seed.');
    return;
  }
  
  console.log('Seeding database with sample data...');
  
  const vehicles = [
    { name: 'Small Truck', capacityKg: 1000, tyres: 4 },
    { name: 'Medium Cargo Van', capacityKg: 2500, tyres: 6 },
    { name: 'Large Delivery Truck', capacityKg: 5000, tyres: 8 },
    { name: 'Pickup Truck', capacityKg: 800, tyres: 4 },
    { name: 'Box Truck', capacityKg: 3500, tyres: 6 },
    { name: 'Refrigerated Van', capacityKg: 1500, tyres: 4 },
    { name: 'Flatbed Truck', capacityKg: 4000, tyres: 8 },
    { name: 'Heavy Hauler', capacityKg: 10000, tyres: 10 },
    { name: 'City Courier', capacityKg: 500, tyres: 4 },
    { name: 'Long-Distance Hauler', capacityKg: 8000, tyres: 12 }
  ];
  
  const createdVehicles = await Vehicle.insertMany(vehicles);
  console.log(`Created ${createdVehicles.length} sample vehicles`);
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  
  const bookings = [
    {
      vehicleId: createdVehicles[0]._id,
      fromPincode: '110001',
      toPincode: '110005',
      customerId: 'customer-1',
      startTime: new Date(today.setHours(10, 0, 0, 0)),
      get endTime() {
        const duration = estimatedRideDurationHours(this.fromPincode, this.toPincode);
        return new Date(this.startTime.getTime() + duration * 3600 * 1000);
      },
      get estimatedRideDurationHours() {
        return estimatedRideDurationHours(this.fromPincode, this.toPincode);
      }
    },
    {
      vehicleId: createdVehicles[1]._id,
      fromPincode: '400001',
      toPincode: '400005',
      customerId: 'customer-2',
      startTime: new Date(today.setHours(14, 0, 0, 0)),
      get endTime() {
        const duration = estimatedRideDurationHours(this.fromPincode, this.toPincode);
        return new Date(this.startTime.getTime() + duration * 3600 * 1000);
      },
      get estimatedRideDurationHours() {
        return estimatedRideDurationHours(this.fromPincode, this.toPincode);
      }
    },
    
    {
      vehicleId: createdVehicles[2]._id,
      fromPincode: '500001',
      toPincode: '500025',
      customerId: 'customer-3',
      startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
      get endTime() {
        const duration = estimatedRideDurationHours(this.fromPincode, this.toPincode);
        return new Date(this.startTime.getTime() + duration * 3600 * 1000);
      },
      get estimatedRideDurationHours() {
        return estimatedRideDurationHours(this.fromPincode, this.toPincode);
      }
    },
    {
      vehicleId: createdVehicles[3]._id,
      fromPincode: '600001',
      toPincode: '600015',
      customerId: 'customer-4',
      startTime: new Date(tomorrow.setHours(13, 0, 0, 0)),
      get endTime() {
        const duration = estimatedRideDurationHours(this.fromPincode, this.toPincode);
        return new Date(this.startTime.getTime() + duration * 3600 * 1000);
      },
      get estimatedRideDurationHours() {
        return estimatedRideDurationHours(this.fromPincode, this.toPincode);
      }
    },
    
    {
      vehicleId: createdVehicles[4]._id,
      fromPincode: '700001',
      toPincode: '700035',
      customerId: 'customer-5',
      startTime: new Date(dayAfter.setHours(11, 0, 0, 0)),
      get endTime() {
        const duration = estimatedRideDurationHours(this.fromPincode, this.toPincode);
        return new Date(this.startTime.getTime() + duration * 3600 * 1000);
      },
      get estimatedRideDurationHours() {
        return estimatedRideDurationHours(this.fromPincode, this.toPincode);
      }
    }
  ];
  
  const createdBookings = await Booking.insertMany(bookings);
  console.log(`Created ${createdBookings.length} sample bookings`);
  
  console.log('Database seeding completed successfully!');
}

module.exports = seedDatabase;
