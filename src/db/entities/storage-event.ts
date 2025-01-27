import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import SyncSession from './sync-session';
import decamelize from 'decamelize';
import camelcase from 'camelcase';
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

@Entity({ name: 'storage_event' })
export default class StorageEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'storage_id' })
  storageId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'batch_id' })
  batchId: string;

  @Column({
    name: 'event_type',
    transformer: {
      from: (value: string) => (value ? camelcase(value) : value),
      to: (value: string) => (value ? decamelize(value) : value),
    },
  })
  eventType:
    | 'addProducts'
    | 'removeProducts'
    | 'changeProductName'
    | 'createStorage'
    | 'deleteStorage'
    | 'changeStorageName';

  @Column({
    name: 'data',
    type: 'jsonb',
    transformer: {
      from: (value) => (value ? camelcaseKeys(value) : value),
      to: (value) => (value ? decamelizeKeys(value) : value),
    },
  })
  data: {
    expiryDate?: Date;
    manufactureDate?: Date;
    productName?: string;
    quantity?: number;
    shelfLifeDays?: number;
    storageName?: string;
  };

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => SyncSession, (syncSession) => syncSession.storageEvents)
  syncSession: SyncSession;
}
