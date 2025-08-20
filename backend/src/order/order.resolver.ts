import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { PlaceOrderInput } from './dto/place-order.input';
import { PlaceStopOrderInput } from './dto/place-stop-order.input';
import { Order } from './entities/order.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { OrderBook } from 'src/order-book/entities/order-book.entity';
import { RolesGuard } from 'src/admin/guards/roles.guard';
import { Roles } from 'src/admin/decorators/roles.decorator';
import {
  OrderPaginationInput,
  UserOrderPaginationInput,
} from './dto/order-admin.input';
import { OrderPaginationResponse } from './entities/order-admin.entity';

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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Order)
  async placeStopOrder(
    @CurrentUser() user: User,
    @Args('input') input: PlaceStopOrderInput,
  ) {
    return this.orderService.placeStopOrder(user.id, input);
  }

  @Mutation(() => Order)
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

  @Query(() => OrderBook)
  async orderBook(@Args('ticker') ticker: string): Promise<OrderBook> {
    return this.orderService.getOrderBook(ticker);
  }

  // Admin queries for order monitoring
  @Query(() => OrderPaginationResponse, { name: 'adminOrders' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminOrders(@Args('input') input: OrderPaginationInput) {
    return this.orderService.getAllOrdersWithPagination(input);
  }

  @Query(() => OrderPaginationResponse, { name: 'adminUserOrders' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminUserOrders(@Args('input') input: UserOrderPaginationInput) {
    return this.orderService.getUserOrdersWithPagination(input);
  }

  // Admin mutation to force cancel any order
  @Mutation(() => Order)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminForceCancelOrder(@Args('orderId') orderId: string) {
    return this.orderService.adminForceCancelOrder(orderId);
  }
}
