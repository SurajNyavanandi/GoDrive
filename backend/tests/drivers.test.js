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

test('Drivers API & Access Control', async (t) => {
  await t.test('GET /api/drivers returns paginated list of approved drivers', async () => {
    const res = await request(app).get('/api/drivers?page=1&limit=10');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.page, 1);
    assert.ok(typeof res.body.total === 'number');
    assert.ok(typeof res.body.totalPages === 'number');
  });

  await t.test('GET /api/admin/drivers rejects unauthorized requests with 401', async () => {
    const res = await request(app).get('/api/admin/drivers');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('GET /api/admin/drivers allows requests with valid admin key', async () => {
    const adminKey = 'godrive-super-secret-admin-key-2026';
    const res = await request(app)
      .get('/api/admin/drivers')
      .set('x-admin-key', adminKey);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });
});
