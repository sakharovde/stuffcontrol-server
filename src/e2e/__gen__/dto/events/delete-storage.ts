import { faker } from '@faker-js/faker';

export const deleteStorage = () => ({
  storageId: faker.string.uuid(),
  eventType: 'deleteStorage',
  eventDate: faker.date.recent().toISOString(),
});
