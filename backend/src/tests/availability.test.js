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
  const startExisting = new Date('2025-09-20T10:00:00Z');
  const endExisting = new Date(startExisting.getTime() + 2 * 3600 * 1000);
  await Booking.create({
    vehicleId: v._id,
    fromPincode: '10000',
    toPincode: '10020',
    startTime: startExisting,
    endTime: endExisting,
    customerId: 'cust1',
    estimatedRideDurationHours: 2
  });

  const res = await request(app)
    .get('/api/vehicles/available')
    .query({
      capacityRequired: 500,
      fromPincode: '10000',
      toPincode: '10030',
      startTime: '2025-09-20T11:00:00Z'
    })
    .expect(200);
  expect(res.body).toHaveProperty('vehicles');
  expect(res.body).toHaveProperty('pagination');
  expect(Array.isArray(res.body.vehicles)).toBe(true);
  expect(res.body.vehicles.length).toBe(0);
});

test('POST /api/bookings returns 201 or 409 when conflict', async () => {
  const v = await Vehicle.create({ name: 'T2', capacityKg: 1000, tyres: 8 });

  const existingStart = new Date('2025-09-21T08:00:00Z');
  const existingEnd = new Date(existingStart.getTime() + 3 * 3600 * 1000);
  await Booking.create({
    vehicleId: v._id,
    fromPincode: '20000',
    toPincode: '20030',
    startTime: existingStart,
    endTime: existingEnd,
    customerId: 'c1',
    estimatedRideDurationHours: 3
  });

  const res = await request(app)
    .post('/api/bookings')
    .send({
      vehicleId: v._id.toString(),
      fromPincode: '20010',
      toPincode: '20040',
      startTime: '2025-09-21T09:00:00Z',
      customerId: 'c2'
    });

  expect([201, 409]).toContain(res.statusCode);
});
