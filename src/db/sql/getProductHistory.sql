with latestSyncSession as (
    select
        "syncDate",
        "snapshot"
    from
        "SyncSession"
    order by
        "syncDate" desc
    limit 1
),
     latestSnaphot as (
         select
             data ->> 'storageId' as storageId,
             data ->> 'productId' as productId,
             data ->> 'batchId' 	 as batchId,
             data ->> 'productName' as productName,
             data ->> 'quantity'  as quantity,
             data ->> 'expiryDate' as expiryDate,
             data ->> 'manufactureDate' as manufactureDate,
             data ->> 'shelfLifeDays' as shelfLifeDays
         from latestSyncSession, jsonb_array_elements(latestSyncSession.snapshot) AS role(data)
     )
select * from latestSnaphot
