import { api } from './__gen__/api';
import { dto } from './__gen__/dto';

it('should create empty storage', async () => {
  const event = dto.events.createStorage();
  const storageId = event.storageId;
  const storageName = event.storageName;

  const response = await api.createSyncSession({
    storageId,
    events: [event],
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
  const event = dto.events.createStorage();
  await api.createSyncSession({
    storageId: event.storageId,
    events: [event],
  });
  const response = await api.getStorageList();

  expect(response.statusCode).toBe(200);
  const json = response.json();

  expect(json?.length).toBeGreaterThan(0);
  expect(json).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        storageId: event.storageId,
        storageName: event.storageName,
      }),
    ])
  );
});
