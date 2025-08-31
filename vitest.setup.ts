import 'dotenv/config';
import { beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import server from './src/app/server'; // Подключи свой Fastify-приложение
import dataSource from './src/db/data-source';
import { FastifyInstance } from 'fastify';

let db: DataSource;
let app: FastifyInstance;

beforeAll(async () => {
  db = dataSource; // Если база данных инициализируется в app
  await db.initialize();
  await db.synchronize(true); // Очистка перед тестами

  app = server;
  await app.ready();
});

afterAll(async () => {
  await db.dropDatabase();
  await server.close();
});
