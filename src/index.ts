import fastify from 'fastify';
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

    return prisma.$queryRawTyped(getProductHistory('test'));
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
