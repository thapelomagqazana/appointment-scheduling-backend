const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');
const bcrypt = require("bcrypt");
const app = require("../../app");
const jwt = require('jsonwebtoken');

describe('Auth Routes', () => {
  let mongoServer;
  let user;

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
    user = await User.findOne({ email: 'doctor@example.com' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('POST /register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'patient'
        });
    //   console.log(res);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id);

      expect(user).toBeTruthy();
      expect(user.email).toBe('test@example.com');
    });

    it('should return 400 if user already exists', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'patient'
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'patient'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('msg', 'User already exists');
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'invalidemail',
          password: 'short',
          role: ''
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toHaveLength(4);
    });
  });

  describe('POST /login', () => {
    it('should log in an existing user and return a token', async () => {

      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'login@example.com',
          password: 'password123',
          role: 'patient'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 400 if credentials are invalid', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('msg', 'Invalid credentials');
    });

    it('should return 400 if validation fails', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalidemail',
          password: ''
        });
      expect(res.status).toBe(400);
    });
  });

  // describe('POST /api/auth/request-password-reset', () => {
  //   it('should send a password reset email', async () => {
  //     const res = await request(app).post('/api/auth/request-password-reset').send({
  //       email: 'doctor@example.com',
  //     });

  //     expect(res.status).toBe(200);
  //     expect(res.body).toBe('Recovery email sent');
  //   });

  //   it('should return an error if email does not exist', async () => {
  //     const res = await request(app).post('/api/auth/request-password-reset').send({
  //       email: 'nonexistent@example.com',
  //     });

  //     expect(res.status).toBe(400);
  //     expect(res.body).toHaveProperty('msg', 'User with this email does not exist');
  //   });
  // });

  // describe('POST /api/auth/reset-password', () => {
  //   let resetToken;

  //   beforeEach(async () => {
  //     const crypto = require('crypto');
  //     resetToken = crypto.randomBytes(20).toString('hex');
  //     const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  //     user.resetPasswordToken = hashedToken;
  //     user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  //     await user.save();
  //   });

  //   it('should reset the password', async () => {
  //     const res = await request(app).post('/api/auth/reset-password').send({
  //       resetToken,
  //       newPassword: 'newpassword123',
  //     });

  //     expect(res.status).toBe(200);
  //     expect(res.body).toHaveProperty('msg', 'Password reset successful');

  //     const updatedUser = await User.findById(user.id);
  //     const isMatch = await bcrypt.compare('newpassword123', updatedUser.password);
  //     expect(isMatch).toBe(true);
  //   });

  //   it('should return an error for invalid token', async () => {
  //     const res = await request(app).post('/api/auth/reset-password').send({
  //       resetToken: 'invalidtoken',
  //       newPassword: 'newpassword123',
  //     });

  //     expect(res.status).toBe(400);
  //     expect(res.body).toHaveProperty('msg', 'Invalid or expired token');
  //   });

  //   it('should return an error for expired token', async () => {
  //     user.resetPasswordExpires = Date.now() - 3600000; // 1 hour ago
  //     await user.save();

  //     const res = await request(app).post('/api/auth/reset-password').send({
  //       resetToken,
  //       newPassword: 'newpassword123',
  //     });

  //     expect(res.status).toBe(400);
  //     expect(res.body).toHaveProperty('msg', 'Invalid or expired token');
  //   });
  // });

});