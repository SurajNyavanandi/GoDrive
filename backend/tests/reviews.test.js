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

test('Reviews API & Input Boundary Validation', async (t) => {
  await t.test('POST /api/drivers/reviews creates review with valid data and otp', async () => {
    const res = await request(app)
      .post('/api/drivers/reviews')
      .send({
        author: 'Suresh Varma',
        title: 'Excellent Service',
        quote: 'Very punctual, drove safely through the peak hour traffic.',
        rating: 5,
        driverId: 'drv-test-1',
        otp: '4821',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.author, 'Suresh Varma');
  });

  await t.test('POST /api/drivers/reviews rejects submission missing required fields', async () => {
    const res = await request(app)
      .post('/api/drivers/reviews')
      .send({
        author: 'Incomplete Reviewer',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/drivers/reviews rejects submission with driverId but missing OTP', async () => {
    const res = await request(app)
      .post('/api/drivers/reviews')
      .send({
        author: 'Anonymous',
        title: 'Good trip',
        quote: 'Arrived on time',
        rating: 4,
        driverId: 'drv-test-1',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'OTP_REQUIRED');
  });

  await t.test('GET /api/drivers/reviews returns paginated reviews on valid query', async () => {
    const res = await request(app).get('/api/drivers/reviews?page=1&limit=20');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.page, 1);
  });

  await t.test('GET /api/drivers/reviews rejects excessive limit exceeding max threshold (100)', async () => {
    const res = await request(app).get('/api/drivers/reviews?page=1&limit=9999');
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.code, 'VALIDATION_ERROR');
  });

  await t.test('GET /api/drivers/reviews rejects negative page number', async () => {
    const res = await request(app).get('/api/drivers/reviews?page=-5&limit=10');
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.code, 'VALIDATION_ERROR');
  });
});
