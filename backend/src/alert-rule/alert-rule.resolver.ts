import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { AlertRuleService } from './alert-rule.service';
import { AlertRule } from './entities/alert-rule.entity';
import { CreateAlertRuleInput } from './dto/create-alert-rule.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Resolver(() => AlertRule)
export class AlertRuleResolver {
  constructor(private readonly alertRuleService: AlertRuleService) {}

  @Mutation(() => AlertRule)
  @UseGuards(GqlAuthGuard)
  createAlertRule(
    @CurrentUser() user: User,
    @Args('input') createAlertRuleInput: CreateAlertRuleInput,
  ) {
    return this.alertRuleService.create(user.id, createAlertRuleInput);
  }

  @Query(() => [AlertRule], { name: 'getMyAlertRules' })
  @UseGuards(GqlAuthGuard)
  getMyAlertRules(@CurrentUser() user: User) {
    return this.alertRuleService.findAllByUser(user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  deleteAlertRule(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.alertRuleService.delete(user.id, id);
  }
}
