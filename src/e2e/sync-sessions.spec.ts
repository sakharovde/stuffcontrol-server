import app from '../app/server';
import { faker } from '@faker-js/faker';

describe('Sync Sessions', () => {
  it('should return 400 when event list is empty', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/sync-session',
      body: { sessionId: faker.string.uuid(), events: [] },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      message: 'At least one event must be provided',
    });
  });
});
