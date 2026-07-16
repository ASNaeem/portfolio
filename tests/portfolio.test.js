const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Project = require('../src/models/Project');
const Message = require('../src/models/Message');
const VisitCounter = require('../src/models/VisitCounter');
const seedDatabase = require('../src/config/seed');

let mongoServer;

beforeAll(async () => {
  // Spin up Mongo Memory Server
  mongoServer = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1',
    }
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Trigger db seeder
  await seedDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Portfolio REST API endpoints', () => {
  test('GET /projects returns the 3 seeded projects', async () => {
    const response = await request(app)
      .get('/projects')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).toBe(3);
    const titles = response.body.map(project => project.title);
    expect(titles).toContain('Culinary Compass');
    expect(titles).toContain('Web Note');
    expect(titles).toContain('Store Management System');
  });

  test('GET /visit increments visitor counter dynamically', async () => {
    // Initially count should be 0 (seeded)
    const initialCounter = await VisitCounter.findOne();
    expect(initialCounter.count).toBe(0);

    // Call /visit (increments count by 1)
    let response = await request(app)
      .get('/visit')
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.visitCount).toBe(1);

    // Call /visit again
    response = await request(app)
      .get('/visit')
      .expect(200);

    expect(response.body.visitCount).toBe(2);
  });

  test('POST /guestbook saves a personal message', async () => {
    const response = await request(app)
      .post('/guestbook')
      .send({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        message: 'Personal message testing',
        message_type: 'personal'
      })
      .expect(201);

    expect(response.body.message).toBe('Entry added successfully!');
    expect(response.body.entry.name).toBe('Jane Doe');
    expect(response.body.entry.message_type).toBe('personal');

    // Confirm stored in DB
    const dbMsg = await Message.findOne({ email: 'jane.doe@example.com' });
    expect(dbMsg).toBeDefined();
    expect(dbMsg.message).toBe('Personal message testing');
  });

  test('POST /guestbook saves a guestbook entry and GET /guestbook returns it', async () => {
    // Add guestbook message
    await request(app)
      .post('/guestbook')
      .send({
        name: 'Guest User',
        message: 'Nice website!',
        message_type: 'guestbook'
      })
      .expect(201);

    // Fetch guestbook messages
    const response = await request(app)
      .get('/guestbook')
      .expect(200);

    // The messages array should contain our new entry (Personal messages shouldn't load here)
    const guestbookEntries = response.body;
    expect(guestbookEntries.length).toBeGreaterThanOrEqual(1);
    expect(guestbookEntries[0].name).toBe('Guest User');
    expect(guestbookEntries[0].message).toBe('Nice website!');
    expect(guestbookEntries[0].message_type).toBe('guestbook');

    const personalMessageInEntries = guestbookEntries.find(entry => entry.name === 'Jane Doe');
    expect(personalMessageInEntries).toBeUndefined(); // Should not return personal type messages
  });

  test('POST /guestbook fails with 400 when name or message is empty', async () => {
    const response = await request(app)
      .post('/guestbook')
      .send({
        name: '',
        message: 'Content',
        message_type: 'guestbook'
      })
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  test('GET /resume parses resume.md and returns structured JSON', async () => {
    const response = await request(app)
      .get('/resume')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.name).toBe('Abu Saleh Muhammad Naeem');
    expect(response.body.summary).toBeDefined();
    expect(response.body.experience.length).toBeGreaterThanOrEqual(1);
    expect(response.body.education.length).toBeGreaterThanOrEqual(1);
    expect(response.body.skills.length).toBeGreaterThanOrEqual(1);
    expect(response.body.research.length).toBeGreaterThanOrEqual(1);
    expect(response.body.achievements.length).toBeGreaterThanOrEqual(1);

    // Verify OonkoO details
    const oonkooExp = response.body.experience.find(exp => exp.company === 'OonkoO');
    expect(oonkooExp).toBeDefined();
    expect(oonkooExp.role).toBe('Junior Backend Developer');
  });

  test('GET /resume.md serves raw markdown file', async () => {
    await request(app)
      .get('/resume.md')
      .expect('Content-Type', /markdown|plain|octet-stream/)
      .expect(200);
  });

  test('GET /resume.pdf serves compiled PDF file', async () => {
    await request(app)
      .get('/resume.pdf')
      .expect('Content-Type', /pdf|octet-stream/)
      .expect(200);
  });
});
