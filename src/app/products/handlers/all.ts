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
    .select('se.product_id', 'productId')
    .addSelect(
      `(SELECT se2.data ->> 'product_name'
        FROM storage_event se2
        WHERE se2.product_id = se.product_id
        ORDER BY se2.created_at DESC
        LIMIT 1)`,
      'productName'
    )
    .addSelect(
      `(SELECT se3.data ->> 'shelf_life_days'
        FROM storage_event se3
        WHERE se3.product_id = se.product_id
        ORDER BY se3.created_at DESC
        LIMIT 1)`,
      'shelfLifeDays'
    )
    .addSelect('MIN(se.created_at)', 'createdAt')
    .where('se.product_id IS NOT NULL')
    .groupBy('se.product_id')
    .getRawMany<ProductInfo>();
};

export default handler;
