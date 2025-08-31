import { addProducts } from './add-products';
import { createStorage } from './create-storage';
import { changeStorageName } from './change-storage-name';
import { changeProductName } from './change-product-name';
import { removeProducts } from './remove-products';

export const events = {
  addProduct: addProducts,
  createStorage,
  changeStorageName,
  changeProductName,
  removeProduct: removeProducts,
};
