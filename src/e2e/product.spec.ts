import { dto } from './__gen__/dto';
import { api } from './__gen__/api';

it('should create a product', async () => {
  // CREATE
  const event = dto.events.addProduct();
  const syncSessionResponse = await api.createSyncSession({
    storageId: event.storageId,
    events: [event],
  });

  expect(syncSessionResponse.statusCode).toBe(200);

  const syncSessionJson = syncSessionResponse.json();

  expect(syncSessionJson?.snapshot?.length).toEqual(1);

  // GET
  const productListResponse = await api.getProductList();

  expect(productListResponse.statusCode).toBe(200);

  const productListJson = productListResponse.json();

  expect(productListJson?.length).toBeGreaterThan(0);
  expect(productListJson).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        productId: event.productId,
        productName: event.productName,
      }),
    ])
  );
});

it('should change product name', async () => {
  // CREATE
  const event = dto.events.addProduct();
  await api.createSyncSession({
    storageId: event.storageId,
    events: [event],
  });

  // CHANGE
  const updateEvent = dto.events.changeProductName();
  updateEvent.storageId = event.storageId;
  updateEvent.productId = event.productId;

  const syncSessionResponse = await api.createSyncSession({
    storageId: updateEvent.storageId,
    events: [updateEvent],
  });

  expect(syncSessionResponse.statusCode).toBe(200);

  const syncSessionJson = syncSessionResponse.json();

  expect(syncSessionJson?.snapshot?.length).toEqual(1);

  // GET
  const productListResponse = await api.getProductList();

  expect(productListResponse.statusCode).toBe(200);

  const productListJson = productListResponse.json();

  expect(productListJson?.length).toBeGreaterThan(0);
  expect(productListJson).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        productId: event.productId,
        productName: updateEvent.productName,
      }),
    ])
  );
});

it('should remove product', async () => {
  // CREATE
  const event = dto.events.addProduct();
  await api.createSyncSession({
    storageId: event.storageId,
    events: [event],
  });

  // REMOVE
  const removeEvent = dto.events.removeProduct();
  removeEvent.storageId = event.storageId;
  removeEvent.productId = event.productId;
  removeEvent.batchId = event.batchId;

  const syncSessionResponse = await api.createSyncSession({
    storageId: removeEvent.storageId,
    events: [removeEvent],
  });

  expect(syncSessionResponse.statusCode).toBe(200);

  const syncSessionJson = syncSessionResponse.json();

  expect(syncSessionJson?.snapshot?.length).toEqual(1);

  // GET
  const productListResponse = await api.getBatchList();

  expect(productListResponse.statusCode).toBe(200);

  const productListJson = productListResponse.json();

  const newQuantity = event.quantity - removeEvent.quantity;

  expect(productListJson?.length).toBeGreaterThan(0);
  expect(productListJson).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        storageId: event.storageId,
        productId: event.productId,
        batchId: event.batchId,
        quantity: newQuantity < 0 ? 0 : newQuantity,
      }),
    ])
  );
});
