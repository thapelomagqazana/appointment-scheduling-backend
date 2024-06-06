const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const app = require("../../app");
const { sendEmail } = require("../../services/notificationService");

jest.mock('../../services/notificationService');

describe('Appointment Controller', () => {
  let mongoServer;
  let patientToken, doctorToken, receptionistToken;
  let patientId, doctorId, receptionistId;
  let date;

  beforeEach(async () => {
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

    // Create some appointments for testing
    await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date: new Date('2024-05-31T10:00:00Z'),
      reason: 'Routine Checkup',
    });

    await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date: new Date('2024-05-31T12:00:00Z'),
      reason: 'Follow-up Visit',
    });

    await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date: new Date('2024-06-01T10:00:00Z'),
      reason: 'Consultation',
    });
    
    
  });

  afterEach(async () => {
    await Appointment.deleteMany();
    await User.deleteMany();
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
          date: new Date("2023-10-22"),
          reason: 'Routine check-up',
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('patient', patientId.toString());
      expect(res.body).toHaveProperty('doctor', doctorId.toString());

      // Check if emails were sent
      expect(sendEmail).toHaveBeenCalledWith(
          'patient@example.com',
          'Appointment Confirmation',
          expect.stringContaining('Your appointment is confirmed')
      );

      expect(sendEmail).toHaveBeenCalledWith(
        'doctor@example.com',
        'Appointment Confirmation',
        expect.stringContaining('Your appointment is confirmed')
    );
    });

    it('should return 400 if there is a conflicting appointment', async () => {
      const appointmentDate = new Date("2023-10-22");

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
      // await Appointment.findOneAndDelete({ patient: patientId });
    });
  });

  describe('GET /api/appointments', () => {
    it('should return all appointments', async () => {
      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter appointments by date', async () => {
      const res = await request(app)
        .get('/api/appointments?date=2024-05-31')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should filter appointments by doctor', async () => {
      const res = await request(app)
        .get(`/api/appointments?doctor=${doctorId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
    });

    it('should filter appointments by patient', async () => {
      const res = await request(app)
        .get(`/api/appointments?patient=${patientId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
    });

    it('should return no appointments for non-matching filters', async () => {
      const res = await request(app)
        .get('/api/appointments')
        .query({ date: new Date('2100-01-01') })
        .set('Authorization', `Bearer ${doctorToken}`);
      // console.log(res.body);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  describe('PUT /update/:id', () => {
    it('should update the appointment status', async () => {
      const appointment = new Appointment({
        patient: patientId,
        doctor: doctorId,
        date: new Date("2023-10-22"),
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

      // Check if emails were sent
      expect(sendEmail).toHaveBeenCalledWith(
          'patient@example.com',
          'Appointment Update',
          expect.stringContaining('Your appointment status has been updated')
      );
      expect(sendEmail).toHaveBeenCalledWith(
          'doctor@example.com',
          'Appointment Update',
          expect.stringContaining('Your appointment status has been updated')
      );
    });
  });

  describe('DELETE /delete/:id', () => {
    it('should delete the appointment', async () => {
      const appointment = new Appointment({
        patient: patientId,
        doctor: doctorId,
        date: new Date("2023-10-22"),
        reason: 'Routine check-up',
      });
      await appointment.save();

      const res = await request(app)
        .delete(`/api/appointments/delete/${appointment.id}`)
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('msg', 'Appointment removed');

      // Check if emails were sent
      expect(sendEmail).toHaveBeenCalledWith(
          'patient@example.com',
          'Appointment Cancellation',
          expect.stringContaining('Your appointment scheduled for')
      );
      expect(sendEmail).toHaveBeenCalledWith(
          'doctor@example.com',
          'Appointment Cancellation',
          expect.stringContaining('Your appointment scheduled for')
      );
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