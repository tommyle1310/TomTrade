-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "isTradable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "suspendReason" TEXT;
