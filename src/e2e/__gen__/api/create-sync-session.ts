import { dto } from '../dto';
import app from '../../../app/server';

type Event = ReturnType<
  | typeof dto.events.createStorage
  | typeof dto.events.changeStorageName
  | typeof dto.events.addProduct
  | typeof dto.events.removeProduct
  | typeof dto.events.changeProductName
>;

export const createSyncSession = (args: {
  storageId: string;
  events: Event[];
}) => {
  return app.inject({
    method: 'POST',
    url: '/api/sync-session',
    body: {
      storageId: args.storageId,
      events: args.events,
    },
  });
};
