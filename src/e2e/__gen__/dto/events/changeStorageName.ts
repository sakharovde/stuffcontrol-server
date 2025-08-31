import { faker } from '@faker-js/faker';

export const changeStorageName = () => ({
  storageId: faker.string.uuid(),
  eventType: 'changeStorageName',
  storageName: faker.commerce.department(),
  eventDate: faker.date.recent().toISOString(),
});
