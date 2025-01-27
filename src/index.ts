import 'dotenv/config';
import server from './app/server';
import DBDataSource from './db/data-source';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const host = 'RENDER' in process.env ? `0.0.0.0` : `localhost`;

server.listen({ host: host, port: port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

DBDataSource.initialize()
  .then(async () => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
