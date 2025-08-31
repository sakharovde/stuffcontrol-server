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
