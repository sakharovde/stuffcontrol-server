-- CreateTable
CREATE TABLE "ProductHistory" (
    "id" TEXT NOT NULL,
    "storageId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "syncSessionId" TEXT,

    CONSTRAINT "ProductHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncSession" (
    "id" TEXT NOT NULL,
    "syncDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storageId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "SyncSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductHistory" ADD CONSTRAINT "ProductHistory_syncSessionId_fkey" FOREIGN KEY ("syncSessionId") REFERENCES "SyncSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
