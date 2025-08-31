import { dto } from '../dto';
import app from '../../../app/server';

export const addProduct = (args: {
  storageId: string;
  events: Array<ReturnType<typeof dto.events.addProduct>>;
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
