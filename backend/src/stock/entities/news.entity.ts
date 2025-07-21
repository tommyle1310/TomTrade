import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class News {
  @Field() id: string;
  @Field() ticker: string;
  @Field() headline: string;
  @Field({ nullable: true }) summary?: string;
  @Field({ nullable: true }) url?: string;
  @Field({ nullable: true }) source?: string;
  @Field({ nullable: true }) sentimentScore?: number;
  @Field({ nullable: true }) type?: string;
  @Field() publishedAt: Date;
}
