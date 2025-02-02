import DBDataSource from '../../../db/data-source';
import SyncSession from '../../../db/entities/sync-session';
import { RouteGenericInterface, RouteHandler } from 'fastify';

const handler: RouteHandler<RouteGenericInterface> = async () => {
  return await DBDataSource.manager.find(SyncSession);
};

export default handler;
