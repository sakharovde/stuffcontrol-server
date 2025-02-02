import 'reflect-metadata';
import { DataSource } from 'typeorm';
import StorageEvent from './entities/storage-event';
import SyncSession from './entities/sync-session';

const DBDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [StorageEvent, SyncSession],
  migrations: [],
  subscribers: [],
});

export default DBDataSource;
