process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { setupTestDb, teardownTestDb } = require('./setup');
const { startServer } = require('../server');

let app;

test.before(async () => {
  await setupTestDb();
  app = await startServer();
});

test.after(async () => {
  await teardownTestDb();
});

test('Bookings API & Access Controls', async (t) => {
  const uniqueNum = Date.now().toString().slice(-8);
  const testPhone = `98${uniqueNum}`;

  await t.test('POST /api/bookings creates booking with valid payload', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        driverId: 'drv-test-1',
        pickupAddress: 'Banjara Hills Road No 12, Hyderabad',
        customerName: 'Aarav Kumar',
        customerPhone: testPhone,
        totalCost: 1200,
        driverType: 'freelance',
        carType: 'SUV',
        transmission: 'Manual',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.booking.id);
    assert.equal(res.body.booking.customerName, 'Aarav Kumar');
  });

  await t.test('POST /api/bookings rejects invalid or short pickup addresses', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        driverId: 'drv-test-1',
        pickupAddress: '123',
        customerPhone: testPhone,
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  await t.test('GET /api/bookings blocks open enumeration without phone or driverId', async () => {
    const res = await request(app).get('/api/bookings');
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'MISSING_QUERY_PARAMETER');
  });

  await t.test('GET /api/bookings allows retrieval with matching customer phone', async () => {
    const res = await request(app).get(`/api/bookings?phone=${testPhone}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 1);
  });
});
