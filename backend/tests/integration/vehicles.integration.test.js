const request = require('supertest');
process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

const createApp = require('../../src/app');
const { connect, closeDatabase, clearDatabase } = require('../setup/mongoMemoryServer');

const app = createApp();

let userToken;
let adminToken;

const registerAndLogin = async (overrides = {}) => {
  const user = {
    name: 'Test User',
    email: 'user@example.com',
    password: 'password123',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(user);
  return res.body.data.token;
};

beforeAll(async () => connect());
afterAll(async () => closeDatabase());

beforeEach(async () => {
  await clearDatabase();
  userToken = await registerAndLogin({ email: 'user@example.com', role: 'user' });
  adminToken = await registerAndLogin({ email: 'admin@example.com', role: 'admin' });
});

const sampleVehicle = {
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  year: 2023,
  price: 22000,
  quantity: 5,
};

describe('Vehicle API', () => {
  it('rejects any request without a token', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.statusCode).toBe(401);
  });

  describe('POST /api/vehicles', () => {
    it('allows an authenticated user to create a vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sampleVehicle);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.make).toBe('Toyota');
      expect(res.body.data.quantity).toBe(5);
    });

    it('rejects a vehicle missing required fields', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ make: 'Toyota' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/vehicles', () => {
    it('returns all vehicles', async () => {
      await request(app).post('/api/vehicles').set('Authorization', `Bearer ${userToken}`).send(sampleVehicle);
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...sampleVehicle, make: 'Honda', model: 'Civic' });

      const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(2);
    });
  });

  describe('GET /api/vehicles/search', () => {
    beforeEach(async () => {
      await request(app).post('/api/vehicles').set('Authorization', `Bearer ${userToken}`).send(sampleVehicle);
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ make: 'Ford', model: 'Explorer', category: 'SUV', price: 38000, quantity: 2 });
    });

    it('filters by make', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=toyota')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].make).toBe('Toyota');
    });

    it('filters by category', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?category=SUV')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.body.count).toBe(1);
      expect(res.body.data[0].category).toBe('SUV');
    });

    it('filters by price range', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=30000&maxPrice=40000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.body.count).toBe(1);
      expect(res.body.data[0].make).toBe('Ford');
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('updates a vehicle', async () => {
      const created = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sampleVehicle);

      const res = await request(app)
        .put(`/api/vehicles/${created.body.data._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 25000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.price).toBe(25000);
    });

    it('returns 404 for a non-existent vehicle', async () => {
      const res = await request(app)
        .put('/api/vehicles/64b6f1f1f1f1f1f1f1f1f1f1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 100 });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('forbids a non-admin user from deleting a vehicle', async () => {
      const created = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sampleVehicle);

      const res = await request(app)
        .delete(`/api/vehicles/${created.body.data._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('allows an admin to delete a vehicle', async () => {
      const created = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sampleVehicle);

      const res = await request(app)
        .delete(`/api/vehicles/${created.body.data._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('decreases quantity by 1 by default', async () => {
      const created = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sampleVehicle);

      const res = await request(app)
        .post(`/api/vehicles/${created.body.data._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.statusCode).toBe(200);
      expect(res.body.data.quantity).toBe(4);
    });

    it('rejects a purchase that exceeds available stock', async () => {
      const created = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...sampleVehicle, quantity: 1 });

      const res = await request(app)
        .post(`/api/vehicles/${created.body.data._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(409);
    });

    it('never allows quantity to go negative when stock is zero', async () => {
      const created = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...sampleVehicle, quantity: 0 });

      const res = await request(app)
        .post(`/api/vehicles/${created.body.data._id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('forbids a non-admin from restocking', async () => {
      const created = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sampleVehicle);

      const res = await request(app)
        .post(`/api/vehicles/${created.body.data._id}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 10 });

      expect(res.statusCode).toBe(403);
    });

    it('allows an admin to restock, increasing quantity', async () => {
      const created = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sampleVehicle);

      const res = await request(app)
        .post(`/api/vehicles/${created.body.data._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.quantity).toBe(15);
    });
  });
});
