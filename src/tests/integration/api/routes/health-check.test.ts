import request from 'supertest';
import app, { initializeServer } from '../../setup-tests';
import { Server } from 'http';

describe('Integration | Health Check API', () => {
  let server: Server | null = null;

  beforeAll(async done => {
    try {
      server = initializeServer();
      done();
    } catch (e) {
      console.error('Failed to init server!');
      console.log(e);
      done(e);
    }
  });

  afterAll(async done => {
    await server?.close();
    done();
  });

  describe('/api/status', () => {
    it('should send a 200 response on a GET request', async () => {
      expect.assertions(1);
      const res = await request(app).get('/api/status');
      expect(res.status).toBe(200);
    });
  });
});
