const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');
const app = require("../../app");

describe('Doctor Controller', () => {
  let mongoServer;
  let token;
  let doctorId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user (doctor)
    await request(app)
    .post('/api/auth/register')
    .send({
        name: 'Doctor Test',
        email: 'doctor@example.com',
        password: 'password123',
        role: 'doctor'
    });
    const doctor = await User.findOne({ email: 'doctor@example.com' });
    doctorId = doctor.id;

    // Generate JWT token
    const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'doctor@example.com', password: 'password123' });
    token = response.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('POST /availability', () => {
    it('should set doctor availability', async () => {
      const res = await request(app)
        .post('/api/doctors/availability')
        .set('Authorization', `Bearer ${token}`)
        .send({
          availability: [{ date: new Date(), slots: ['09:00', '10:00', '11:00'] }]
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('user', doctorId.toString());
      expect(res.body).toHaveProperty('availability');
      expect(res.body.availability).toBeInstanceOf(Array);
    });
  });

  describe('GET /availability/:id', () => {
    it('should get doctor availability', async () => {
      // Set availability first
      await request(app)
        .post('/api/doctors/availability')
        .set('Authorization', `Bearer ${token}`)
        .send({
          availability: [{ date: new Date(), slots: ['09:00', '10:00', '11:00'] }]
        });

      const res = await request(app)
        .get(`/api/doctors/availability/${doctorId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('availability');
      expect(res.body.availability).toBeInstanceOf(Array);
    });
  });
});