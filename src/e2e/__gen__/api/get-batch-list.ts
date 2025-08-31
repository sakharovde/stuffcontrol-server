import app from '../../../app/server';

export const getBatchList = () => {
  return app.inject({
    method: 'GET',
    url: '/api/batches',
  });
};
