// tests/appointment.test.js

const mongoose = require('mongoose');
const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Appointment Model', () => {
  let mongoServer;
  let patient;
  let doctor;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    patient = new User({
      name: 'Patient One',
      email: 'patient1@example.com',
      password: 'password123',
      role: 'patient',
    });

    doctor = new User({
      name: 'Doctor One',
      email: 'doctor1@example.com',
      password: 'password123',
      role: 'doctor',
    });

    await patient.save();
    await doctor.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Appointment.deleteMany({});
  });

  it('should create and save an appointment successfully', async () => {
    const appointmentData = {
      patient: patient._id,
      doctor: doctor._id,
      date: new Date(),
      reason: 'Routine check-up',
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    const savedAppointment = await Appointment.findOne({ _id: appointment._id }).populate('patient').populate('doctor');

    expect(savedAppointment).toBeDefined();
    expect(savedAppointment.patient.email).toBe(patient.email);
    expect(savedAppointment.doctor.email).toBe(doctor.email);
    expect(savedAppointment.status).toBe('scheduled');
  });

  it('should fail to create an appointment without a patient', async () => {
    const appointmentData = {
      doctor: doctor._id,
      date: new Date(),
      reason: 'Routine check-up',
    };

    let error;
    try {
      const appointment = new Appointment(appointmentData);
      await appointment.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.patient.message).toBe('Path `patient` is required.');
  });

  it('should fail to create an appointment without a doctor', async () => {
    const appointmentData = {
      patient: patient._id,
      date: new Date(),
      reason: 'Routine check-up',
    };

    let error;
    try {
      const appointment = new Appointment(appointmentData);
      await appointment.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.doctor.message).toBe('Path `doctor` is required.');
  });

  it('should fail to create an appointment without a date', async () => {
    const appointmentData = {
      patient: patient._id,
      doctor: doctor._id,
      reason: 'Routine check-up',
    };

    let error;
    try {
      const appointment = new Appointment(appointmentData);
      await appointment.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.date.message).toBe('Date is required');
  });

  it('should have a default status of "scheduled"', async () => {
    const appointmentData = {
      patient: patient._id,
      doctor: doctor._id,
      date: new Date(),
      reason: 'Routine check-up',
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    const savedAppointment = await Appointment.findOne({ _id: appointment._id });

    expect(savedAppointment).toBeDefined();
    expect(savedAppointment.status).toBe('scheduled');
  });
});
