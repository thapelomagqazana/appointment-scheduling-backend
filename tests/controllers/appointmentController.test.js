const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const app = require("../../app");

describe('Appointment Controller', () => {
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

  describe('POST /create', () => {
    it('should create a new appointment', async () => {
      const res = await request(app)
        .post('/api/appointments/create')
        .set('Authorization', `Bearer ${patientToken}`)
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

    it('should return 400 if there is a conflicting appointment', async () => {
      const appointmentDate = new Date();

      // Create an existing appointment
      await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        date: appointmentDate,
        reason: 'Routine Checkup'
      });

      const res = await request(app)
        .post('/api/appointments/create')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          patient: patientId,
          doctor: doctorId,
          date: appointmentDate,
          reason: 'Follow-up Visit'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('msg', 'Doctor is already booked for this time slot');
    });
  });

  describe('GET /', () => {
    it('should get all appointments', async () => {
      const res = await request(app)
        .get('/api/appointments/')
        .set('Authorization', `Bearer ${doctorToken}`);

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
        .set('Authorization', `Bearer ${receptionistToken}`)
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
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('msg', 'Appointment removed');
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