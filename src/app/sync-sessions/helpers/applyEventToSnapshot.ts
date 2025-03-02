import SyncSession from '../../../db/entities/sync-session';
import StorageEvent from '../../../db/entities/storage-event';

const applyEventToSnapshot = (
  snapshot: SyncSession['snapshot'],
  event: StorageEvent
): SyncSession['snapshot'] => {
  switch (event.eventType) {
    case 'addProducts': {
      const key = `${event.productId}-${event.batchId}-${event.storageId}`;
      const existingItem = snapshot.find(
        (item) => `${item.productId}-${item.batchId}-${item.storageId}` === key
      );

      if (existingItem) {
        return snapshot.map((item) =>
          item === existingItem
            ? {
                ...item,
                quantity: item.quantity + Number(event.data.quantity || 0),
              }
            : item
        );
      } else {
        // Создаём новый продукт
        return [
          ...snapshot,
          {
            productId: event.productId!,
            batchId: event.batchId!,
            storageId: event.storageId!,
            productName: event.data.productName || 'Unknown',
            quantity: Number(event.data.quantity || 0),
            expiryDate: event.data.expiryDate || undefined,
            manufactureDate: event.data.manufactureDate || undefined,
            shelfLifeDays: event.data.shelfLifeDays || undefined,
          },
        ];
      }
    }

    case 'removeProducts': {
      const key = `${event.productId}-${event.batchId}-${event.storageId}`;
      return snapshot.map((item) =>
        `${item.productId}-${item.batchId}-${item.storageId}` === key
          ? {
              ...item,
              quantity: Math.max(
                0,
                item.quantity - Number(event.data.quantity || 0)
              ),
            }
          : item
      );
    }

    case 'changeProductName': {
      return snapshot.map((item) =>
        item.productId === event.productId
          ? {
              ...item,
              productName: event.data.productName || item.productName,
            }
          : item
      );
    }

    case 'createStorage': {
      if (!snapshot.some((item) => item.storageId === event.storageId)) {
        return [
          ...snapshot,
          {
            productId: '',
            batchId: '',
            storageId: event.storageId!,
            productName: '',
            quantity: 0,
          },
        ];
      }
      return snapshot;
    }

    case 'deleteStorage': {
      return snapshot.filter((item) => item.storageId !== event.storageId);
    }

    case 'changeStorageName': {
      return snapshot.map((item) =>
        item.storageId === event.storageId
          ? {
              ...item,
              productName: event.data.storageName || item.productName,
            }
          : item
      );
    }

    default:
      return snapshot;
  }
};

export default applyEventToSnapshot;
