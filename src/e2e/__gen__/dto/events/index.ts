import { addProducts } from './add-products';
import { createStorage } from './create-storage';
import { changeStorageName } from './change-storage-name';
import { changeProductName } from './change-product-name';
import { removeProducts } from './remove-products';
import { deleteStorage } from './delete-storage';

export const events = {
  addProducts,
  createStorage,
  changeStorageName,
  changeProductName,
  deleteStorage,
  removeProducts,
};
