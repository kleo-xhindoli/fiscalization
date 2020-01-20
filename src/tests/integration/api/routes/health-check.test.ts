import request from 'supertest';
import app, { server } from '../../../../index';

describe('Integration | Health Check API', () => {
  afterAll(async done => {
    await server.close();
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
