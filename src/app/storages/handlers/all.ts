import { RouteGenericInterface, RouteHandler } from 'fastify';
import DBDataSource from '../../../db/data-source';
import StorageEvent from '../../../db/entities/storage-event';

interface StorageInfo {
  storageId: string;
  storageName: string | null;
  createdAt: Date;
}

const handler: RouteHandler<RouteGenericInterface> = async () => {
  const storageEventsRepository = DBDataSource.getRepository(StorageEvent);

  return await storageEventsRepository
    .createQueryBuilder('se')
    .select('se.storage_id', 'storageId')
    .addSelect(
      `(SELECT se2.data ->> 'storage_name'
        FROM storage_event se2
        WHERE se2.storage_id = se.storage_id
        ORDER BY se2.created_at DESC
        LIMIT 1)`,
      'storageName'
    )
    .addSelect('MIN(se.created_at)', 'createdAt')
    .groupBy('se.storage_id')
    .getRawMany<StorageInfo>();
};

export default handler;
