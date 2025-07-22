/*
  Warnings:

  - A unique constraint covering the columns `[userId,ticker]` on the table `Portfolio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_userId_ticker_key" ON "Portfolio"("userId", "ticker");
