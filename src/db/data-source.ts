import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
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
  logging: process.env.NODE_ENV !== 'test',
  entities: [StorageEvent, SyncSession],
  migrations: [],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy(),
});

export default DBDataSource;
