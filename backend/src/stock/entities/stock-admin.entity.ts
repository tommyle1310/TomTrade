import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Stock } from './stock.entity';

@ObjectType()
export class StockPaginationMeta {
  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  limit: number;
}

@ObjectType()
export class StockPaginationResponse {
  @Field(() => [Stock])
  stocks: Stock[];

  @Field(() => StockPaginationMeta)
  meta: StockPaginationMeta;
}
