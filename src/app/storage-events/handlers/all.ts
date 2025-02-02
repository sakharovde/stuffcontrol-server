import DBDataSource from '../../../db/data-source';
import StorageEvent from '../../../db/entities/storage-event';
import { RouteGenericInterface, RouteHandler } from 'fastify';

const handler: RouteHandler<RouteGenericInterface> = async () => {
  return await DBDataSource.manager.find(StorageEvent);
};

export default handler;
