import { getStorageList } from './get-storage-list';
import { createSyncSession } from './create-sync-session';
import { getProductList } from './get-product-list';
import { getBatchList } from './get-batch-list';

export const api = {
  getBatchList,
  getProductList,
  getStorageList,
  createSyncSession,
};
