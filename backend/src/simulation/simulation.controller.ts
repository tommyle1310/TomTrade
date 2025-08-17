import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { SimulationService } from './simulation.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../admin/guards/roles.guard';
import { Roles } from '../admin/decorators/roles.decorator';

@Resolver()
@UseGuards(GqlAuthGuard)
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Query(() => String)
  async simulationStatus() {
    return JSON.stringify(this.simulationService.getSimulationStatus());
  }

  @Mutation(() => String)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async startSimulation() {
    return JSON.stringify(await this.simulationService.startSimulation());
  }

  @Mutation(() => String)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async stopSimulation() {
    return JSON.stringify(await this.simulationService.stopSimulation());
  }

  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async triggerPriceAlert(
    @Args('userId') userId: string,
    @Args('ticker') ticker: string,
  ) {
    await this.simulationService.triggerPriceAlert(userId, ticker);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async triggerOrderNotification(
    @Args('userId') userId: string,
    @Args('type') type: 'ORDER_FILLED' | 'ORDER_PARTIAL' | 'ORDER_CANCELLED',
  ) {
    await this.simulationService.triggerOrderNotification(userId, type);
    return true;
  }
}
