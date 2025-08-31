import { faker } from '@faker-js/faker';

export const removeProducts = () => ({
  storageId: faker.string.uuid(),
  productId: faker.string.uuid(),
  batchId: faker.string.uuid(),
  eventType: 'removeProducts',
  eventDate: faker.date.recent().toISOString(),
  quantity: faker.number.int(),
});
