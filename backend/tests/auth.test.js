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

test('Auth Lifecycle & Security', async (t) => {
  const uniqueId = Date.now();
  const testUser = {
    name: 'Test Driver User',
    email: `test_${uniqueId}@example.com`,
    password: 'Password123!',
    phone: `98765${String(uniqueId).slice(-5)}`,
  };

  let accessToken = '';
  let refreshToken = '';

  await t.test('POST /api/auth/register creates user and returns tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.ok(res.body.data.refreshToken);
    assert.equal(res.body.data.user.email, testUser.email);
    accessToken = res.body.data.token;
    refreshToken = res.body.data.refreshToken;
  });

  await t.test('POST /api/auth/register rejects duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/auth/login succeeds with correct password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
  });

  await t.test('POST /api/auth/login fails with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123',
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/auth/refresh issues new access token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
  });

  await t.test('GET /api/auth/me returns user profile with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testUser.email);
  });

  await t.test('GET /api/auth/me rejects request without Bearer token', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
  });
});
