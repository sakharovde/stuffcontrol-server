import app from '../../../app/server';

export const getProductList = () => {
  return app.inject({
    method: 'GET',
    url: '/api/products',
  });
};
