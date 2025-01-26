import fastify from 'fastify';
import cors from '@fastify/cors';
import registrationHandler from './auth/handlers/registration';
import verifyRegistrationHandler from './auth/handlers/verifyRegistration';
import authenticationHandler from './auth/handlers/authentication';
import verifyAuthenticationHandler from './auth/handlers/verifyAuthentication';

const server = fastify({
  logger: true,
});

server.register(cors);

server.get('/ping', async (request, reply) => {
  return 'pong\n';
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

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const host = 'RENDER' in process.env ? `0.0.0.0` : `localhost`;

server.listen({ host: host, port: port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
