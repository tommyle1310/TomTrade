import { Module } from '@nestjs/common';
import { WatchlistResolver } from './watchlist.resolver';
import { WatchlistService } from './watchlist.service';

@Module({
  providers: [WatchlistResolver, WatchlistService]
})
export class WatchlistModule {}
