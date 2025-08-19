import { Field, ID, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class AdminUser {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field()
  email: string;

  @Field()
  role: string;

  @Field()
  isBanned: boolean;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Float, { defaultValue: 0 })
  balance: number;
}
