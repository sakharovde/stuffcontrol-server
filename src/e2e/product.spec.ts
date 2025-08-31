import { dto } from './__gen__/dto';
import { api } from './__gen__/api';

it('should create a product', async () => {
  const event = dto.events.addProduct();
  const response = await api.createSyncSession({
    storageId: event.storageId,
    events: [dto.events.addProduct()],
  });

  expect(response.statusCode).toBe(200);

  const json = response.json();

  expect(json?.snapshot?.length).toEqual(1);
});

it('should return product in product list', async () => {
  const event = dto.events.addProduct();

  await api.createSyncSession({
    storageId: event.storageId,
    events: [event],
  });
  const response = await api.getProductList();

  expect(response.statusCode).toBe(200);

  const json = response.json();

  expect(json?.length).toBeGreaterThan(0);
  expect(json).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        productId: event.productId,
        productName: event.productName,
      }),
    ])
  );
});
