import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Stock } from 'src/stock/entities/stock.entity';

@ObjectType()
export class Watchlist {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

  @Field(() => [Stock])
  stocks: Stock[];
}
