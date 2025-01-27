import fastify, { RouteGenericInterface } from 'fastify';
import fastifyCors from '@fastify/cors';
import registrationHandler from './auth/handlers/registration';
import verifyRegistrationHandler from './auth/handlers/verifyRegistration';
import authenticationHandler from './auth/handlers/authentication';
import verifyAuthenticationHandler from './auth/handlers/verifyAuthentication';
import DBDataSource from '../db/data-source';
import StorageEvent from '../db/entities/storage-event';
import getProductsHistoryQuery from '../db/queries/getProductHistory.query';
import SyncSession from '../db/entities/sync-session';

const server = fastify({
  logger: true,
});

server.register(fastifyCors);

server.route({
  method: 'GET',
  url: '/ping',
  handler: async () => {
    return 'pong\n';
  },
});

// registration
server
  .route({
    method: 'POST',
    url: '/api/register',
    handler: registrationHandler,
  })
  .route({
    method: 'POST',
    url: '/api/register/verify',
    handler: verifyRegistrationHandler,
  });

// authentication
server
  .route({
    method: 'POST',
    url: '/api/authenticate',
    handler: authenticationHandler,
  })
  .route({
    method: 'POST',
    url: '/api/authenticate/verify',
    handler: verifyAuthenticationHandler,
  });

server.route({
  method: 'GET',
  url: '/test',
  handler: async () => {
    return await DBDataSource.manager.query(getProductsHistoryQuery());
  },
});

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

server.route<SyncRoute>({
  method: 'POST',
  url: '/sync',
  handler: async (req) => {
    const storageId = req.body.storageId;
    const mapBodyItemToData = (body: ProductHistoryItem) => ({
      storageId: body.storageId || storageId,
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

    let storageEvents = await DBDataSource.manager.create(
      StorageEvent,
      req.body.events.map(mapBodyItemToData)
    );
    storageEvents = await DBDataSource.manager.save(storageEvents);

    const snapshot = await DBDataSource.manager.query(
      getProductsHistoryQuery()
    );
    let syncSession = await DBDataSource.manager.create(SyncSession, {
      storageId,
      snapshot,
    });
    syncSession = await DBDataSource.manager.save(syncSession);

    await DBDataSource.manager.save(
      storageEvents.map((event) => {
        event.syncSession = syncSession;
        return event;
      })
    );

    return await DBDataSource.manager.findOne(SyncSession, {
      where: { id: syncSession.id },
      relations: ['storageEvents'],
    });
  },
});

export default server;
