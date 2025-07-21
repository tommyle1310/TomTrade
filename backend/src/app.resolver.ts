import { Query, Resolver } from '@nestjs/graphql';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class Hello {
  @Field()
  message: string;
}

@Resolver(() => Hello)
export class AppResolver {
  @Query(() => Hello)
  sayHello(): Hello {
    return { message: 'Hello from GraphQL!' };
  }
}
