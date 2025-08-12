import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class AuthPayload {
  @Field() accessToken: string;
  @Field(() => User) user: User;
  @Field() role: string;
}

@InputType()
export class SignUpInput {
  @Field() name: string;
  @Field() email: string;
  @Field() password: string;
}

@InputType()
export class LoginInput {
  @Field() email: string;
  @Field() password: string;
}
