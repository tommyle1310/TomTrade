import { Field, ID, ObjectType } from "@nestjs/graphql";

// src/user/entities/user.entity.ts
@ObjectType()
export class User {
  @Field(() => ID) id: string;
  @Field() email: string;
  @Field(() => Date) createdAt: Date;
}
