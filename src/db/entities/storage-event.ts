import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import SyncSession from './sync-session';
import decamelize from 'decamelize';
import camelcase from 'camelcase';
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

@Entity()
export default class StorageEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  storageId: string;

  @Column('uuid')
  productId: string;

  @Column('uuid')
  batchId: string;

  @Column('varchar', {
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
    type: 'jsonb',
    transformer: {
      from: (value) => (value ? camelcaseKeys(value) : value),
      to: (value) => (value ? decamelizeKeys(value) : value),
    },
  })
  data: {
    expiryDate?: string;
    manufactureDate?: string;
    productName?: string;
    quantity?: number;
    shelfLifeDays?: number;
    storageName?: string;
  };

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => SyncSession, (syncSession) => syncSession.storageEvents)
  syncSession: SyncSession;
}
