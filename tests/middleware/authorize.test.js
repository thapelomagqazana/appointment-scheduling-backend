const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');
const app = require("../../app");

describe('RBAC Middleware', () => {
  let mongoServer;
  let patientToken, doctorToken, receptionistToken;
  let patientId, doctorId, receptionistId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test users and get their IDs
    patientId = await createUserAndGetId('Patient Test', 'patient@example.com', 'password123', 'patient');
    doctorId = await createUserAndGetId('Doctor Test', 'doctor@example.com', 'password123', 'doctor');
    receptionistId = await createUserAndGetId('Receptionist Test', 'receptionist@example.com', 'password123', 'receptionist');

    // Generate JWT tokens
    patientToken = await loginAndGetToken('patient@example.com', 'password123');
    doctorToken = await loginAndGetToken('doctor@example.com', 'password123');
    receptionistToken = await loginAndGetToken('receptionist@example.com', 'password123');
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('POST /api/appointments/create', () => {
    it('should allow access for patient role', async () => {
      const res = await request(app)
        .post('/api/appointments/create')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          patient: patientId,
          doctor: doctorId,
          date: new Date(),
          reason: 'Routine check-up',
        });
      expect(res.status).toBe(200);
    });

    it('should deny access for doctor role', async () => {
      const res = await request(app)
        .post('/api/appointments/create')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          patient: patientId,
          doctor: doctorId,
          date: new Date(),
          reason: 'Routine check-up',
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Access denied');
    });

    it('should deny access for receptionist role', async () => {
      const res = await request(app)
        .post('/api/appointments/create')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({
          patient: patientId,
          doctor: doctorId,
          date: new Date(),
          reason: 'Routine check-up',
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Access denied');
    });
  });

  async function createUserAndGetId(name, email, password, role) {
    await request(app)
      .post('/api/auth/register')
      .send({ name, email, password, role });
    const user = await User.findOne({ email });
    return user.id;
  }

  async function loginAndGetToken(email, password) {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    return response.body.token;
  }
});
