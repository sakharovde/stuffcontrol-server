const getAllProductsQuery = () => `
    SELECT product_id,
           MAX(data ->> 'product_name')    AS product_name,
           MAX(data ->> 'shelf_life_days') AS shelf_life_days,
           MIN(created_at)                 AS created_at
    FROM storage_event
    GROUP BY product_id
`;

export default getAllProductsQuery;
