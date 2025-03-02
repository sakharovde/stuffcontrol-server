import DBDataSource from '../../../db/data-source';
import { RouteGenericInterface, RouteHandler } from 'fastify';
import StorageEvent from '../../../db/entities/storage-event';

interface ProductInfo {
  productId: string;
  productName: string | null;
  shelfLifeDays: string | null;
  createdAt: Date;
}

const handler: RouteHandler<RouteGenericInterface> = async () => {
  const storageEventsRepository = DBDataSource.getRepository(StorageEvent);

  return await storageEventsRepository
    .createQueryBuilder('se')
    .select('se.productId', 'productId')
    .addSelect("MAX(se.data ->> 'product_name')", 'productName')
    .addSelect("MAX(se.data ->> 'shelf_life_days')", 'shelfLifeDays')
    .addSelect('MIN(se.createdAt)', 'createdAt')
    .groupBy('se.productId')
    .getRawMany<ProductInfo>();
};

export default handler;
