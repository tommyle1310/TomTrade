/*
  Warnings:

  - A unique constraint covering the columns `[userId,ticker,ruleType]` on the table `AlertRule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AlertRule_userId_ticker_ruleType_key" ON "AlertRule"("userId", "ticker", "ruleType");
