const mongoose = require('mongoose');
const Doctor = require('../../models/Doctor');
const User = require('../../models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Doctor Model', () => {
  let mongoServer;
  let user;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    user = new User({
      name: 'Doctor User',
      email: 'doctor@example.com',
      password: 'password123',
      role: 'doctor',
    });

    await user.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Doctor.deleteMany({});
  });

  it('should create and save a doctor successfully', async () => {
    const doctorData = {
      user: user._id,
      availability: [
        {
          date: new Date(),
          slots: ['09:00-10:00', '10:00-11:00'],
        },
      ],
    };

    const doctor = new Doctor(doctorData);
    await doctor.save();

    const savedDoctor = await Doctor.findOne({ _id: doctor._id }).populate('user');

    expect(savedDoctor).toBeDefined();
    expect(savedDoctor.user.email).toBe(user.email);
    expect(savedDoctor.availability).toHaveLength(1);
    expect(savedDoctor.availability[0].slots).toContain('09:00-10:00');
  });

  it('should fail to create a doctor without a user', async () => {
    const doctorData = {
      availability: [
        {
          date: new Date(),
          slots: ['09:00-10:00', '10:00-11:00'],
        },
      ],
    };

    let error;
    try {
      const doctor = new Doctor(doctorData);
      await doctor.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.user.message).toBe('Path `user` is required.');
  });

  it('should fail to create a doctor with availability slots missing', async () => {
    const doctorData = {
      user: user._id,
      availability: [
        {
          date: new Date(),
          slots: [],
        },
      ],
    };

    let error;
    try {
      const doctor = new Doctor(doctorData);
      await doctor.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors['availability.0.slots'].message).toBe('Slots array should not be empty');
  });

  it('should fail to create a doctor with availability date missing', async () => {
    const doctorData = {
      user: user._id,
      availability: [
        {
          slots: ['09:00-10:00', '10:00-11:00'],
        },
      ],
    };

    let error;
    try {
      const doctor = new Doctor(doctorData);
      await doctor.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors['availability.0.date'].message).toBe('Path `date` is required.');
  });
});