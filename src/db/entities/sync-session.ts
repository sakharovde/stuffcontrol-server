import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import StorageEvent from './storage-event';
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';

@Entity({ name: 'sync_session' })
export default class SyncSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'storage_id' })
  storageId: string;

  @Column({
    name: 'snapshot',
    type: 'jsonb',
    transformer: {
      from: (value) => (value ? camelcaseKeys(value, { deep: true }) : value),
      to: (value) => (value ? decamelizeKeys(value, { deep: true }) : value),
    },
  })
  snapshot: Array<{
    storageId: string;
    productId: string;
    batchId: string;
    productName: string;
    quantity: string;
    expiryDate?: string;
    manufactureDate?: string;
    shelfLifeDays?: string;
  }>;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => StorageEvent, (storageEvent) => storageEvent.syncSession)
  storageEvents: StorageEvent[];
}
