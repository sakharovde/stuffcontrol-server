import DBDataSource from '../../../db/data-source';
import { RouteGenericInterface, RouteHandler } from 'fastify';
import getAllProductsQuery from '../../../db/queries/getAllProducts.query';

const handler: RouteHandler<RouteGenericInterface> = async () => {
  return await DBDataSource.manager.query(getAllProductsQuery());
};

export default handler;
