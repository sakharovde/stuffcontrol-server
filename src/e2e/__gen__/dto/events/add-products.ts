import { faker } from '@faker-js/faker';

export const addProducts = () => ({
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
});
