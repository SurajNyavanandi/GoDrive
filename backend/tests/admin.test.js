process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const crypto = require('crypto');
const { setupTestDb, teardownTestDb } = require('./setup');
const { startServer } = require('../server');
const User = require('../models/User');
const env = require('../config/env');

let app;
const adminKey = 'godrive-super-secret-admin-key-2026';

test.before(async () => {
  await setupTestDb();
  app = await startServer();
});

test.after(async () => {
  await teardownTestDb();
});

test('Admin Management & State Transitions', async (t) => {
  let createdDriverId = null;

  await t.test('POST /api/admin/drivers creates driver with approved status', async () => {
    const res = await request(app)
      .post('/api/admin/drivers')
      .set('x-admin-key', adminKey)
      .send({
        name: 'Ramesh Naidu',
        phone: '9876543210',
        licenseNo: 'TS0920210001234',
        aadhaarNo: '1234 5678 9012',
        driverType: 'freelance',
        location: 'Hyderabad',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.driver.id);
    createdDriverId = res.body.driver.id;
    assert.equal(res.body.driver.isApproved, true);
  });

  await t.test('PUT /api/admin/drivers/:id/block blocks driver', async () => {
    const res = await request(app)
      .put(`/api/admin/drivers/${createdDriverId}/block`)
      .set('x-admin-key', adminKey)
      .send({ reason: 'Investigation of customer report' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  await t.test('PUT /api/admin/drivers/:id/unblock unblocks driver', async () => {
    const res = await request(app)
      .put(`/api/admin/drivers/${createdDriverId}/unblock`)
      .set('x-admin-key', adminKey);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.driver.status, 'Available');
  });

  await t.test('PUT /api/admin/drivers/:id/subscription extends days', async () => {
    const res = await request(app)
      .put(`/api/admin/drivers/${createdDriverId}/subscription`)
      .set('x-admin-key', adminKey)
      .send({ days: 30 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.driver.remainingDays >= 30);
  });

  await t.test('GET /api/admin/history returns recorded audit trail', async () => {
    const res = await request(app)
      .get('/api/admin/history?page=1&limit=10')
      .set('x-admin-key', adminKey);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 1);
  });

  await t.test('GET /api/admin/pricing returns pricing configuration with cache header', async () => {
    const res = await request(app)
      .get('/api/admin/pricing')
      .set('x-admin-key', adminKey);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.freelanceSubscriptionPrice);
    assert.ok(res.headers['cache-control'].includes('public'));
  });

  await t.test('PUT /api/admin/pricing updates pricing configuration and invalidates cache', async () => {
    const res = await request(app)
      .put('/api/admin/pricing')
      .set('x-admin-key', adminKey)
      .send({ freelanceSubscriptionPrice: 59 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.freelanceSubscriptionPrice, 59);
  });

  await t.test('Admin Email & Password Setup / Login Workflow', async (t2) => {
    const adminEmail = (Array.isArray(env.adminEmails) && env.adminEmails[0]) || 'chety@gmail.com';

    await t2.test('Rejects password setup for non-whitelisted email', async () => {
      const res = await request(app)
        .post('/api/admin/request-password-setup')
        .send({ email: 'unauthorized_intruder@test.com' });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    await t2.test('Dispatches setup code for authorized admin email', async () => {
      const res = await request(app)
        .post('/api/admin/request-password-setup')
        .send({ email: adminEmail });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });

    await t2.test('Sets admin password using verification code and logs in', async () => {
      const user = await User.findOne({ email: adminEmail }).select('+resetPasswordToken +resetPasswordExpire');
      assert.ok(user);

      const testCode = '654321';
      user.resetPasswordToken = crypto.createHash('sha256').update(testCode).digest('hex');
      user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      const setRes = await request(app)
        .post('/api/admin/set-password')
        .send({
          email: adminEmail,
          token: testCode,
          password: 'SecretAdminPassword123!',
        });

      assert.equal(setRes.status, 200);
      assert.equal(setRes.body.success, true);
      assert.ok(setRes.body.data.token);

      const loginRes = await request(app)
        .post('/api/admin/login')
        .send({
          email: adminEmail,
          password: 'SecretAdminPassword123!',
        });

      assert.equal(loginRes.status, 200);
      assert.equal(loginRes.body.success, true);
      assert.ok(loginRes.body.data.token);
      assert.equal(loginRes.body.data.user.email, adminEmail);

      const bearerToken = loginRes.body.data.token;
      const historyRes = await request(app)
        .get('/api/admin/history?page=1&limit=5')
        .set('Authorization', `Bearer ${bearerToken}`);

      assert.equal(historyRes.status, 200);
      assert.equal(historyRes.body.success, true);
    });

    await t2.test('Rejects login with invalid password', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          email: adminEmail,
          password: 'WrongPassword!',
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });
  });

  await t.test('404 Handler returns standard error envelope without stack trace', async () => {
    const res = await request(app).get('/api/non-existent-route-xyz');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.code, 'NOT_FOUND');
    assert.equal(res.body.stack, undefined);
  });
});
