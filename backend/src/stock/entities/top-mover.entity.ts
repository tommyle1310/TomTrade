import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class TopMover {
  @Field()
  symbol: string;

  @Field(() => String, { nullable: true })
  avatar: string | null;

  @Field(() => Float)
  value: number; // percentage change
}

@ObjectType()
export class TopMoversPaginationResponse {
  @Field(() => [TopMover])
  data: TopMover[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  totalPages: number;
}
