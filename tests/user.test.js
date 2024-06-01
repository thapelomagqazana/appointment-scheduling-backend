const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('User Model', () => {
    let mongoServer;
  
    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });
  
    afterAll(async () => {
      await mongoose.connection.close();
      await mongoServer.stop();
    });
  
    afterEach(async () => {
      await User.deleteMany({});
    });
  
    it('should hash the password before saving', async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'patient',
      });
  
      await user.save();
      const savedUser = await User.findOne({ email: 'john@example.com' });
      
      expect(savedUser).toBeDefined();
      expect(savedUser.password).not.toBe('password123');
      const isMatch = await bcrypt.compare('password123', savedUser.password);
      expect(isMatch).toBe(true);
    });
  
    it('should not hash the password if it is not modified', async () => {
      const user = new User({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'patient',
      });
  
      await user.save();
      const savedUser = await User.findOne({ email: 'jane@example.com' });
      savedUser.name = 'Jane Smith';
      await savedUser.save();
      
      const reloadedUser = await User.findOne({ email: 'jane@example.com' });
      const isMatch = await bcrypt.compare('password123', reloadedUser.password);
      expect(isMatch).toBe(true);
    });
  
    it('should validate email format', async () => {
      const user = new User({
        name: 'Invalid Email',
        email: 'invalidemail',
        password: 'password123',
        role: 'patient',
      });
  
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }
  
      expect(error).toBeDefined();
      expect(error.errors.email.message).toBe('Please fill a valid email address');
    });
  
    it('should enforce unique email', async () => {
      const user1 = new User({
        name: 'John Doe',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'patient',
      });
  
      const user2 = new User({
        name: 'Jane Doe',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'patient',
      });
  
      await user1.save();
      
      let error;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }
  
      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // Duplicate key error code
    });
  });