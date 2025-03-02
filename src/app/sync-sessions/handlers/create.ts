import { RouteGenericInterface, RouteHandler } from 'fastify';
import DBDataSource from '../../../db/data-source';
import SyncSession from '../../../db/entities/sync-session';
import StorageEvent from '../../../db/entities/storage-event';
import getAllBatchesQuery from '../../../db/queries/getAllBatches.query';

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

  return DBDataSource.manager.transaction(async (transactionEntityManager) => {
    let storageEvents = await transactionEntityManager.create(
      StorageEvent,
      req.body.events.map(mapBodyItemToData)
    );
    storageEvents = await transactionEntityManager.save(storageEvents);

    const snapshot = await transactionEntityManager.query(getAllBatchesQuery());
    let syncSession = await transactionEntityManager.create(SyncSession, {
      storageId,
      snapshot,
    });
    syncSession = await transactionEntityManager.save(syncSession);

    await transactionEntityManager.save(
      storageEvents.map((event) => {
        event.syncSession = syncSession;
        return event;
      })
    );

    return await transactionEntityManager.findOne(SyncSession, {
      where: { id: syncSession.id },
      relations: ['storageEvents'],
    });
  });
};

export default handler;
