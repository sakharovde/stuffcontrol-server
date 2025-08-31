import { api } from './__gen__/api';
import { dto } from './__gen__/dto';

it('should create empty storage', async () => {
  const event = dto.events.createStorage();
  const storageId = event.storageId;
  const storageName = event.storageName;

  const syncSessionResponse = await api.createSyncSession({
    storageId,
    events: [event],
  });

  expect(syncSessionResponse.statusCode).toBe(200);
  const syncSessionJson = syncSessionResponse.json();

  expect(syncSessionJson?.storageId).toEqual(storageId);
  expect(syncSessionJson?.snapshot?.length).toEqual(0);
  expect(syncSessionJson?.storageEvents?.length).toEqual(1);
  expect(syncSessionJson?.storageEvents[0].data).toEqual({
    storageName,
  });

  const storageListResponse = await api.getStorageList();

  expect(storageListResponse.statusCode).toBe(200);
  const storageListJson = storageListResponse.json();

  expect(storageListJson?.length).toBeGreaterThan(0);
  expect(storageListJson).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        storageId: event.storageId,
        storageName: event.storageName,
      }),
    ])
  );
});

it('should change storage name', async () => {
  const event = dto.events.createStorage();
  await api.createSyncSession({
    storageId: event.storageId,
    events: [event],
  });

  const updateEvent = dto.events.changeStorageName();
  updateEvent.storageId = event.storageId;

  const syncSessionResponse = await api.createSyncSession({
    storageId: updateEvent.storageId,
    events: [updateEvent],
  });

  expect(syncSessionResponse.statusCode).toBe(200);
  const syncSessionJson = syncSessionResponse.json();

  expect(syncSessionJson?.storageId).toEqual(event.storageId);
  expect(syncSessionJson?.storageEvents[0].data.storageName).toEqual(
    updateEvent.storageName
  );

  const storageListResponse = await api.getStorageList();

  expect(storageListResponse.statusCode).toBe(200);
  const storageListJson = storageListResponse.json();

  expect(storageListJson?.length).toBeGreaterThan(0);
  expect(storageListJson).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        storageId: event.storageId,
        storageName: updateEvent.storageName,
      }),
    ])
  );
});

it('should delete storage', async () => {
  const event = dto.events.createStorage();
  await api.createSyncSession({
    storageId: event.storageId,
    events: [event],
  });

  let storageListResponse = await api.getStorageList();
  expect(storageListResponse.statusCode).toBe(200);

  let storageListJson = storageListResponse.json();

  expect(storageListJson?.length).toBeGreaterThan(0);
  expect(storageListJson).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        storageId: event.storageId,
        storageName: event.storageName,
      }),
    ])
  );

  const deleteEvent = dto.events.deleteStorage();
  deleteEvent.storageId = event.storageId;

  await api.createSyncSession({
    storageId: deleteEvent.storageId,
    events: [deleteEvent],
  });

  storageListResponse = await api.getStorageList();

  expect(storageListResponse.statusCode).toBe(200);
  storageListJson = storageListResponse.json();

  expect(storageListJson).not.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        storageId: event.storageId,
        storageName: event.storageName,
      }),
    ])
  );
});
