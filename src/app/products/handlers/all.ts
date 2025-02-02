import DBDataSource from '../../../db/data-source';
import { RouteGenericInterface, RouteHandler } from 'fastify';
import getAllBatchesQuery from '../../../db/queries/getAllBatches.query';

const handler: RouteHandler<RouteGenericInterface> = async () => {
  return await DBDataSource.manager.query(getAllBatchesQuery());
};

export default handler;
