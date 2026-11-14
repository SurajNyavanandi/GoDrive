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

test('Health Endpoints', async (t) => {
  await t.test('GET /health returns valid health JSON with status and uptime', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.timestamp);
    assert.ok(typeof res.body.data.uptime === 'number');
    assert.ok(typeof res.body.data.database === 'object');
  });

  await t.test('GET /api/health returns valid health status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.timestamp);
  });

  await t.test('GET /health/live returns liveness probe 200 OK', async () => {
    const res = await request(app).get('/health/live');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.ok(typeof res.body.uptime === 'number');
  });

  await t.test('GET /api/health/live returns liveness probe 200 OK', async () => {
    const res = await request(app).get('/api/health/live');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  await t.test('GET /health/ready returns readiness probe 200 OK with connected DB', async () => {
    const res = await request(app).get('/health/ready');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'ready');
    assert.equal(res.body.data.database.connected, true);
  });

  await t.test('GET /api/health/ready returns readiness probe 200 OK', async () => {
    const res = await request(app).get('/api/health/ready');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'ready');
  });
});
