import { RouteGenericInterface, RouteHandler } from 'fastify';
import DBDataSource from '../../../db/data-source';
import SyncSession from '../../../db/entities/sync-session';

const handler: RouteHandler<RouteGenericInterface> = async () => {
  return await DBDataSource.manager
    .findOne(SyncSession, {
      where: {},
      order: { createdAt: 'DESC' },
    })
    .then((session) => session?.snapshot);
};

export default handler;
