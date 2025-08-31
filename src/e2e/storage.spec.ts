import { faker } from '@faker-js/faker';
import { api } from './__gen__/api';

it('should create empty storage', async () => {
  const storageId = faker.string.uuid();
  const storageName = faker.commerce.department();
  const eventDate = faker.date.recent().toISOString();

  const response = await api.createStorage({
    storageId,
    storageName,
    eventDate,
  });

  expect(response.statusCode).toBe(200);
  const json = response.json();

  expect(json?.storageId).toEqual(storageId);
  expect(json?.snapshot?.length).toEqual(0);
  expect(json?.storageEvents?.length).toEqual(1);
  expect(json?.storageEvents[0].data).toEqual({
    storageName,
  });
});

it('should get created storage in storage list', async () => {
  await api.createEmptyStorage();
  const response = await api.getStorageList();

  expect(response.statusCode).toBe(200);
  const json = response.json();

  expect(json?.length).toBeGreaterThan(0);
  expect(json).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        storageId: expect.any(String),
        storageName: expect.any(String),
        createdAt: expect.any(String),
      }),
    ])
  );
});
