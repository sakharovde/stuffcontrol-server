import fastify, { RouteGenericInterface } from 'fastify';
import cors from '@fastify/cors';
import registrationHandler from './app/auth/handlers/registration';
import verifyRegistrationHandler from './app/auth/handlers/verifyRegistration';
import authenticationHandler from './app/auth/handlers/authentication';
import verifyAuthenticationHandler from './app/auth/handlers/verifyAuthentication';
import getPrisma from './db/getPrisma';
import { getProductHistory } from '@prisma/client/sql';

const server = fastify({
  logger: true,
});

server.register(cors);

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
    const prisma = getPrisma();

    return prisma.$queryRawTyped(
      getProductHistory('eca09b7b-200e-4c11-96bb-ddbf031faa4d')
    );
  },
});

export type ProductHistoryItem = {
  id?: string;
  storageId: string;
  productId: string;
  batchId: string;
  eventType: 'add' | 'remove' | 'changeName' | 'createStorage';
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
    const prisma = getPrisma();

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

    await prisma.productHistory.createMany({
      data: req.body.events.map(mapBodyItemToData),
    });
    const snapshot = await prisma.$queryRawTyped(getProductHistory(storageId));
    const syncSession = await prisma.syncSession.create({
      data: {
        storageId,
        snapshot,
      },
    });
    await prisma.productHistory.updateMany({
      where: { syncSessionId: null },
      data: { syncSessionId: syncSession.id },
    });

    return prisma.syncSession.findFirst({
      where: { id: syncSession.id },
      include: { productEvents: true },
    });
  },
});

server.ready().then(async () => {
  await getPrisma().$disconnect();
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const host = 'RENDER' in process.env ? `0.0.0.0` : `localhost`;

server.listen({ host: host, port: port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
