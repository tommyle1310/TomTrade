/*
  Warnings:

  - A unique constraint covering the columns `[ticker,interval,timestamp]` on the table `MarketData` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MarketData_ticker_interval_timestamp_key" ON "MarketData"("ticker", "interval", "timestamp");
