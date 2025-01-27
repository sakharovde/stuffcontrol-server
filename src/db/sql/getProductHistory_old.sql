WITH latestSnapshot AS (SELECT "storageId",
                               "snapshot"::jsonb AS snapshot_data,
                               "syncDate"
                        FROM "SyncSession"
                        WHERE "storageId" = $1
                        ORDER BY "syncDate" DESC
                        LIMIT 1),
     historyAfterSnapshot AS (SELECT "productId",
                                     "batchId",
                                     "storageId",
                                     "eventType",
                                     "eventDate",
                                     data ->> 'quantity'              AS quantity,
                                     data ->> 'productName'           AS productName,
                                     data ->> 'shelfLifeDays'         AS shelfLifeDays,
                                     date(data ->> 'expiryDate')      AS expiryDate,
                                     date(data ->> 'manufactureDate') AS manufactureDate
                              FROM "ProductHistory"
                              WHERE "eventDate" > (SELECT "syncDate" FROM latestSnapshot)),
     updatedBatches AS (SELECT h."productId",
                               h."batchId",
                               h."storageId",
                               MAX(h.productName)     AS productName,
                               MAX(h.expiryDate)      AS expiryDate,
                               MAX(h.manufactureDate) AS manufactureDate,
                               SUM(CASE
                                       WHEN h."eventType" = 'add' THEN CAST(h.quantity AS numeric)
                                       WHEN h."eventType" = 'remove' THEN -CAST(h.quantity AS numeric)
                                       ELSE 0
                                   END
                               )                      AS quantity
                        FROM historyAfterSnapshot h
                        GROUP BY h."productId", h."batchId", h."storageId"),
     finalState AS (SELECT ub."storageId",
                           ub."batchId",
                           ub."productId",
                           ub.productName,
                           ub.expiryDate,
                           ub.manufactureDate,
                           ub.quantity
                    FROM updatedBatches ub
                             FULL JOIN
                         latestSnapshot ls ON ub."storageId" = ls."storageId" -- соединяем, чтобы учесть всё из снепшота и истории
                    WHERE ub.quantity > 0)
SELECT *
FROM finalState
ORDER BY "storageId", "productId", "batchId";
