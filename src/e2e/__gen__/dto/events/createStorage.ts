import { faker } from '@faker-js/faker';

export const createStorage = () => ({
  storageId: faker.string.uuid(),
  eventType: 'createStorage',
  storageName: faker.commerce.department(),
  eventDate: faker.date.recent().toISOString(),
});
