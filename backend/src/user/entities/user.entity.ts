import { Field, ID, ObjectType } from '@nestjs/graphql';

// src/user/entities/user.entity.ts
@ObjectType()
export class User {
  @Field(() => ID) id: string;
  @Field() email: string;
  @Field() passwordHash: string;
  @Field() role: string;
  @Field() isBanned: boolean;
  @Field(() => String, { nullable: true }) avatar?: string | null;
  @Field(() => Date) createdAt: Date;
}
