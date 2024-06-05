const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const app = require("../../app");

describe('Appointment Controller', () => {
  let mongoServer;
  let token;
  let patientId;
  let doctorId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user (patient)
    await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Patient Test',
          email: 'patient@example.com',
          password: 'password123',
          role: 'patient'
        });
    const patient = await User.findOne({ email: 'patient@example.com' });
    patientId = patient.id;

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
            .send({ email: 'patient@example.com', password: 'password123' });
    token = response.body.token;
    
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('POST /create', () => {
    it('should create a new appointment', async () => {
      const res = await request(app)
        .post('/api/appointments/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patient: patientId,
          doctor: doctorId,
          date: new Date(),
          reason: 'Routine check-up',
        });
      // console.log(res);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('patient', patientId.toString());
      expect(res.body).toHaveProperty('doctor', doctorId.toString());
    });
  });

  describe('GET /', () => {
    it('should get all appointments', async () => {
      const res = await request(app)
        .get('/api/appointments/')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  describe('PUT /update/:id', () => {
    it('should update the appointment status', async () => {
      const appointment = new Appointment({
        patient: patientId,
        doctor: doctorId,
        date: new Date(),
        reason: 'Routine check-up',
      });
      await appointment.save();

      const res = await request(app)
        .put(`/api/appointments/update/${appointment.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'confirmed' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', appointment.id);
      expect(res.body).toHaveProperty('status', 'confirmed');
    });
  });

  describe('DELETE /delete/:id', () => {
    it('should delete the appointment', async () => {
      const appointment = new Appointment({
        patient: patientId,
        doctor: doctorId,
        date: new Date(),
        reason: 'Routine check-up',
      });
      await appointment.save();

      const res = await request(app)
        .delete(`/api/appointments/delete/${appointment.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('msg', 'Appointment removed');
    });
  });
});