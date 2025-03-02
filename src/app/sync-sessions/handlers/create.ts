import { RouteGenericInterface, RouteHandler } from 'fastify';
import DBDataSource from '../../../db/data-source';
import SyncSession from '../../../db/entities/sync-session';
import StorageEvent from '../../../db/entities/storage-event';
import applyEventToSnapshot from '../helpers/applyEventToSnapshot';

export type ProductHistoryItem = {
  id?: string;
  storageId: string;
  productId: string;
  batchId: string;
  eventType: StorageEvent['eventType'];
  eventDate: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  syncSessionId?: string | null;

  // data: JsonNullValueInput | InputJsonValue;
  quantity?: number;
  productName?: string;
  expiryDate?: string;
  manufactureDate?: string;
  storageName?: string;
};

interface SyncRoute extends RouteGenericInterface {
  Body: {
    storageId: string;
    events: ProductHistoryItem[];
  };
}

const handler: RouteHandler<SyncRoute> = async (req, reply) => {
  const storageId = req.body.storageId;

  if (!req.body.events || !req.body.events?.length) {
    return reply.status(400).send({
      message: 'At least one event must be provided',
    });
  }

  const mapBodyItemToData = (body: ProductHistoryItem) => ({
    storageId: storageId,
    productId: body.productId,
    batchId: body.batchId,
    eventType: body.eventType,
    eventDate: body.eventDate,
    data: {
      ...(body.quantity ? { quantity: body.quantity } : {}),
      ...(body.productName ? { productName: body.productName } : {}),
      ...(body.storageName ? { storageName: body.storageName } : {}),
      ...(body.expiryDate ? { expiryDate: body.expiryDate } : {}),
      ...(body.manufactureDate
        ? { manufactureDate: body.manufactureDate }
        : {}),
    },
  });

  let newStorageEvents = DBDataSource.manager.create(
    StorageEvent,
    req.body.events.map(mapBodyItemToData)
  );

  const latestSyncSession = await DBDataSource.manager.findOne(SyncSession, {
    where: { storageId },
    order: { createdAt: 'DESC' },
  });
  const latestSnapshot = latestSyncSession?.snapshot || [];

  const newSnapshot = newStorageEvents.reduce(
    (snapshot, event) => applyEventToSnapshot(snapshot, event),
    latestSnapshot
  );

  await DBDataSource.manager.transaction(async (transactionEntityManager) => {
    newStorageEvents = await transactionEntityManager.save(newStorageEvents);

    let newSyncSession = DBDataSource.manager.create(SyncSession, {
      storageId,
      snapshot: newSnapshot,
      storageEvents: newStorageEvents,
    });
    await transactionEntityManager.save(newSyncSession);
  });

  return DBDataSource.manager.findOne(SyncSession, {
    where: { storageId },
    order: { createdAt: 'DESC' },
    relations: ['storageEvents'],
  });
};

export default handler;
