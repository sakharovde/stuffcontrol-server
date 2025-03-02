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
    .addSelect("MAX(se.data ->> 'storage_name')", 'storageName')
    .addSelect('MIN(se.created_at)', 'createdAt')
    .groupBy('se.storage_id')
    .getRawMany<StorageInfo>();
};

export default handler;
