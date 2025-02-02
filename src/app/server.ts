import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import registrationHandler from './auth/handlers/registration';
import verifyRegistrationHandler from './auth/handlers/verifyRegistration';
import authenticationHandler from './auth/handlers/authentication';
import verifyAuthenticationHandler from './auth/handlers/verifyAuthentication';
import createSyncSessionHandler from './sync-sessions/handlers/create';
import allStorageEventsHandler from './storage-events/handlers/all';
import allSyncSessionsHandler from './sync-sessions/handlers/all';
import allProductsHandler from './products/handlers/all';
import allBatchesHandler from './batches/handlers/all';

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

// storage events
server.route({
  method: 'GET',
  url: '/api/storage-events',
  handler: allStorageEventsHandler,
});

// products
server.route({
  method: 'GET',
  url: '/api/products',
  handler: allProductsHandler,
});

// batches
server.route({
  method: 'GET',
  url: '/api/batches',
  handler: allBatchesHandler,
});

// sync sessions
server
  .route({
    method: 'GET',
    url: '/api/sync-sessions',
    handler: allSyncSessionsHandler,
  })
  .route({
    method: 'POST',
    url: '/api/sync-session',
    handler: createSyncSessionHandler,
  });

export default server;
