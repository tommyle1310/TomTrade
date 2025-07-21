/*
  Warnings:

  - Changed the type of `action` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TransactionAction" AS ENUM ('BUY', 'SELL');

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "action",
ADD COLUMN     "action" "TransactionAction" NOT NULL;
