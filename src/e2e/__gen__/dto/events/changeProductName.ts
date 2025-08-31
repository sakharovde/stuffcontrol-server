import { faker } from '@faker-js/faker';

export const changeProductName = () => ({
  storageId: faker.string.uuid(),
  productId: faker.string.uuid(),
  eventType: 'changeProductName',
  eventDate: faker.date.recent().toISOString(),
  productName: faker.commerce.productName(),
});
