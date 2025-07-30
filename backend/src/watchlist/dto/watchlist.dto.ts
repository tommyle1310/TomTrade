import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateWatchlistInput {
  @Field()
  name: string;
}

@InputType()
export class AddStockToWatchlistInput {
  @Field()
  watchlistId: string;

  @Field()
  ticker: string;
}
