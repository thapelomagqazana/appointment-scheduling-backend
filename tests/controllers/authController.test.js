const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('../../routes/authRoutes');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

describe('Auth Routes', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
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
        // console.log(res);
      expect(res.status).toBe(400);
    //   console.log(res.body);
    //   expect(res.body.errors).toHaveLength(2);
    });
  });

});