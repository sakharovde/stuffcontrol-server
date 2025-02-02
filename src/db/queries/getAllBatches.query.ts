const getProductsHistoryQuery = () => {
  return `
      with latest_sync_session as (select created_at, snapshot
                                   from sync_session
                                   order by created_at desc
                                   limit 1),
           latest_snaphot as (select data ->> 'storage_id'       as storage_id,
                                     data ->> 'product_id'       as product_id,
                                     data ->> 'batch_id'         as batch_id,
                                     data ->> 'product_name'     as product_name,
                                     data ->> 'quantity'         as quantity,
                                     data ->> 'expiry_date'      as expiry_date,
                                     data ->> 'manufacture_date' as manufacture_date,
                                     data ->> 'shelf_life_days'  as shelf_life_days
                              from latest_sync_session,
                                   jsonb_array_elements(latest_sync_session.snapshot) AS role(data)),
           history_after_snapshot AS (SELECT product_id,
                                             batch_id,
                                             storage_id,
                                             event_type,
                                             created_at,
                                             data ->> 'quantity'               AS quantity,
                                             data ->> 'product_name'           AS product_name,
                                             data ->> 'shelf_life_days'        AS shelf_life_days,
                                             date(data ->> 'expiry_date')      AS expiry_date,
                                             date(data ->> 'manufacture_date') AS manufacture_date
                                      FROM storage_event se
                                      WHERE se."syncSessionId" is null),
           updated_batches AS (SELECT h.product_id,
                                      h.batch_id,
                                      h.storage_id,
                                      MAX(h.product_name)     AS product_name,
                                      SUM(CASE
                                              WHEN h.event_type = 'add_product' THEN CAST(h.quantity AS numeric)
                                              WHEN h.event_type = 'remove_product' THEN -CAST(h.quantity AS numeric)
                                              ELSE 0
                                          END
                                      )                       AS quantity,
                                      MAX(h.expiry_date)      AS expiry_date,
                                      MAX(h.manufacture_date) AS manufacture_date,
                                      MAX(h.shelf_life_days)  AS shelf_life_days
                               FROM history_after_snapshot h
                               GROUP BY h.product_id, h.batch_id, h.storage_id),
           all_batches AS (SELECT ub.storage_id,
                                  ub.batch_id,
                                  ub.product_id,
                                  ub.product_name,
                                  CAST(ub.quantity AS numeric) AS quantity,
                                  date(ub.expiry_date)         AS expiry_date,
                                  date(ub.manufacture_date)    AS manufacture_date,
                                  ub.shelf_life_days
                           FROM updated_batches ub
                           UNION ALL
                           SELECT ls.storage_id,
                                  ls.batch_id,
                                  ls.product_id,
                                  ls.product_name,
                                  CAST(ls.quantity AS numeric) AS quantity,
                                  date(ls.expiry_date)         AS expiry_date,
                                  date(ls.manufacture_date)    AS manufacture_date,
                                  ls.shelf_life_days
                           FROM latest_snaphot ls),
           final_state AS (SELECT ab.storage_id,
                                  ab.product_id,
                                  ab.product_name,
                                  ab.batch_id,
                                  SUM(ab.quantity) as quantity,
                                  ab.expiry_date,
                                  ab.manufacture_date,
                                  ab.shelf_life_days
                           FROM all_batches ab
                           GROUP BY ab.storage_id, ab.product_id, ab.batch_id, ab.product_name, ab.expiry_date, ab.manufacture_date, ab.shelf_life_days)
      select *
      from final_state
  `;
};

export default getProductsHistoryQuery;
