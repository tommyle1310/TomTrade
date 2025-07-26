import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { PlaceOrderInput } from './dto/place-order.input';
import { Order } from './entities/order.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private orderService: OrderService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Order)
  async placeOrder(
    @CurrentUser() user: User,
    @Args('input') input: PlaceOrderInput,
  ) {
    return this.orderService.placeOrder(user.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async cancelOrder(
    @CurrentUser() user: User,
    @Args('orderId') orderId: string,
  ) {
    return this.orderService.cancelOrder(user.id, orderId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Order])
  myOrders(@CurrentUser() user: User) {
    return this.orderService.getUserOrders(user.id);
  }
}
