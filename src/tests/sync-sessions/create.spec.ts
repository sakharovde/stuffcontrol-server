import app from '../../app/server';
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

  it('should return 200 when products were added', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/sync-session',
      body: {
        storageId: faker.string.uuid(),
        events: [
          {
            storageId: faker.string.uuid(),
            productId: faker.string.uuid(),
            batchId: faker.string.uuid(),
            eventType: 'addProducts',
            eventDate: faker.date.recent().toISOString(),
            quantity: faker.number.int(),
            productName: faker.commerce.productName(),
            storageName: faker.commerce.department(),
            expiryDate: faker.date.future().toISOString(),
            manufactureDate: faker.date.past().toISOString(),
          },
        ],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()?.snapshot?.length).toEqual(1);
  });
});
