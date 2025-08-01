import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayload, LoginInput, SignUpInput } from './dto/auth.payload.dto';
import { User } from 'src/user/entities/user.entity';
import { CurrentUser } from './decorators/current-user.decorator';
import { GqlAuthGuard } from './gql-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService) {}

  @Mutation(() => AuthPayload)
  signUp(@Args('input') input: SignUpInput) {
    return this.auth.signUp(input);
  }

  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput) {
    return this.auth.login(input);
  }

  // Example protected query
  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  me(@CurrentUser() user: User) {
    return user;
  }
}
