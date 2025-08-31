import app from '../../../app/server';

export const getStorageList = () => {
  return app.inject({
    method: 'GET',
    url: '/api/storages',
  });
};
