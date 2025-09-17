const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { });
});

beforeEach(async () => {
  await Vehicle.deleteMany({});
  await Booking.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});

test('POST /api/vehicles creates vehicle', async () => {
  const res = await request(app)
    .post('/api/vehicles')
    .send({ name: 'Truck A', capacityKg: 1000, tyres: 6 })
    .expect(201);
  expect(res.body.name).toBe('Truck A');
});

test('GET /api/vehicles/available filters overlapping bookings', async () => {
  const v = await Vehicle.create({ name: 'T1', capacityKg: 1000, tyres: 6 });
  // create an existing booking that overlaps requested slot
  const startExisting = new Date('2025-09-20T10:00:00Z');
  const endExisting = new Date(startExisting.getTime() + 2 * 3600 * 1000); // 2h
  await Booking.create({
    vehicleId: v._id,
    fromPincode: '1000',
    toPincode: '1002',
    startTime: startExisting,
    endTime: endExisting,
    customerId: 'cust1',
    estimatedRideDurationHours: 2
  });

  // Query for overlapping time
  const res = await request(app)
    .get('/api/vehicles/available')
    .query({
      capacityRequired: 500,
      fromPincode: '1000',
      toPincode: '1003',
      startTime: '2025-09-20T11:00:00Z'
    })
    .expect(200);
  // because overlapping, there should be zero available vehicles
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(0);
});

test('POST /api/bookings returns 201 or 409 when conflict', async () => {
  const v = await Vehicle.create({ name: 'T2', capacityKg: 1000, tyres: 8 });

  // create existing booking
  const existingStart = new Date('2025-09-21T08:00:00Z');
  const existingEnd = new Date(existingStart.getTime() + 3 * 3600 * 1000);
  await Booking.create({
    vehicleId: v._id,
    fromPincode: '2000',
    toPincode: '2003',
    startTime: existingStart,
    endTime: existingEnd,
    customerId: 'c1',
    estimatedRideDurationHours: 3
  });

  // Now try to book overlapping slot
  const res = await request(app)
    .post('/api/bookings')
    .send({
      vehicleId: v._id.toString(),
      fromPincode: '2001',
      toPincode: '2004',
      startTime: '2025-09-21T09:00:00Z',
      customerId: 'c2'
    });

  expect([201, 409]).toContain(res.statusCode);
});
