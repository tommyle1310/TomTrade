-- CreateEnum
CREATE TYPE "TimeInForce" AS ENUM ('GTC', 'IOC', 'FOK');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "timeInForce" "TimeInForce" NOT NULL DEFAULT 'GTC';
