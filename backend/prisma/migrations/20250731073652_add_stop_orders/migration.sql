-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderType" ADD VALUE 'STOP_LIMIT';
ALTER TYPE "OrderType" ADD VALUE 'STOP_MARKET';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "triggerPrice" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Order_ticker_type_triggerPrice_idx" ON "Order"("ticker", "type", "triggerPrice");
