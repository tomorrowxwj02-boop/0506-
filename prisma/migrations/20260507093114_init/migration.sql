-- CreateTable
CREATE TABLE "TemplateMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateSignature" TEXT NOT NULL,
    "mappingName" TEXT NOT NULL,
    "columnMapping" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "external_code" TEXT,
    "sender_name" TEXT NOT NULL,
    "sender_phone" TEXT NOT NULL,
    "sender_address" TEXT NOT NULL,
    "receiver_name" TEXT NOT NULL,
    "receiver_phone" TEXT NOT NULL,
    "receiver_address" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "piece_count" INTEGER NOT NULL,
    "temperature" TEXT NOT NULL,
    "remark" TEXT,
    "batch_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateMapping_templateSignature_key" ON "TemplateMapping"("templateSignature");

-- CreateIndex
CREATE INDEX "shipments_external_code_idx" ON "shipments"("external_code");

-- CreateIndex
CREATE INDEX "shipments_receiver_name_idx" ON "shipments"("receiver_name");

-- CreateIndex
CREATE INDEX "shipments_created_at_idx" ON "shipments"("created_at");
