const request = require('supertest');
const app = require('../src/app');

describe('Portfolio REST API endpoints', () => {
  test('GET /projects returns the static projects from projects.json', async () => {
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

  test('GET /github-stats returns stats JSON (cached or live)', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          public_repos: 25,
          name: 'Abu Saleh Muhammad Naeem',
          avatar_url: 'https://avatars.githubusercontent.com/u/23430695?v=4'
        })
      })
    );

    const response = await request(app)
      .get('/github-stats')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.public_repos).toBe(25);
    expect(response.body.name).toBe('Abu Saleh Muhammad Naeem');
    expect(response.body.avatar_url).toBeDefined();

    global.fetch = originalFetch;
  });
});
