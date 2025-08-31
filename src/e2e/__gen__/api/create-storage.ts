import app from '../../../app/server';
import { faker } from '@faker-js/faker';

export const createStorage = (args: {
  storageId: string;
  storageName: string;
  eventDate: string;
}) => {
  return app.inject({
    method: 'POST',
    url: '/api/sync-session',
    body: {
      storageId: args.storageId,
      events: [
        {
          storageId: args.storageId,
          eventType: 'createStorage',
          storageName: args.storageName,
          eventDate: args.eventDate,
        },
      ],
    },
  });
};

export const createEmptyStorage = () => {
  const storageId = faker.string.uuid();
  const storageName = faker.commerce.department();
  const eventDate = faker.date.recent().toISOString();

  return app.inject({
    method: 'POST',
    url: '/api/sync-session',
    body: {
      storageId,
      events: [
        {
          storageId,
          eventType: 'createStorage',
          storageName,
          eventDate,
        },
      ],
    },
  });
};
