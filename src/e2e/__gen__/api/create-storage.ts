import app from '../../../app/server';
import { dto } from '../dto';

export const createStorage = (args: {
  storageId: string;
  storageName: string;
  eventDate: string;
}) => {
  const event = dto.events.createStorage();

  event.storageId = args.storageId;
  event.storageName = args.storageName;
  event.eventDate = args.eventDate;

  return app.inject({
    method: 'POST',
    url: '/api/sync-session',
    body: {
      storageId: event.storageId,
      events: [event],
    },
  });
};

export const createEmptyStorage = () => {
  const event = dto.events.createStorage();

  return app.inject({
    method: 'POST',
    url: '/api/sync-session',
    body: {
      storageId: event.storageId,
      events: [event],
    },
  });
};
