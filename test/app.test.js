import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';

const request = (server, method, path, body) => new Promise((resolve, reject) => {
  const payload = body === undefined ? undefined : JSON.stringify(body);
  const req = http.request({ port: server.address().port, path, method, headers: payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {} }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
  });
  req.on('error', reject);
  if (payload) req.write(payload);
  req.end();
});

let server;
test.before(() => { server = app.listen(0); });
test.after(() => server.close());

test('GET /health responds successfully', async () => {
  const response = await request(server, 'GET', '/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('malformed sale ID returns a validation error before database access', async () => {
  const response = await request(server, 'GET', '/sales/not-an-id');
  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Validation failed');
});

test('invalid sale payload returns validation errors before database access', async () => {
  const response = await request(server, 'POST', '/sales', { customer_name: '', storage_gb: 0 });
  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Validation failed');
});

test('missing required create fields are rejected before database access', async () => {
  const response = await request(server, 'POST', '/sales', { customer_name: 'Aarav Sharma' });
  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Validation failed');
  assert.ok(response.body.details.some((detail) => detail.field === 'phone_model'));
});

test('invalid JSON returns HTTP 400', async () => {
  const response = await new Promise((resolve, reject) => {
    const req = http.request({ port: server.address().port, path: '/sales', method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
      let data = ''; res.on('data', (chunk) => { data += chunk; }); res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject); req.end('{invalid');
  });
  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Invalid JSON request body');
});
