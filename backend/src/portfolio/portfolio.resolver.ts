import { Query, Resolver } from '@nestjs/graphql';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioService } from './portfolio.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Resolver('Portfolio')
export class PortfolioResolver {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Query(() => [Portfolio], { name: 'myPortfolio' })
  @UseGuards(GqlAuthGuard)
  myPortfolio(@CurrentUser() user: User) {
    return this.portfolioService.getByUser(user.id);
  }
}
