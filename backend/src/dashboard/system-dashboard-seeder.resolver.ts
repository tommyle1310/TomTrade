import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../admin/guards/roles.guard';
import { Roles } from '../admin/decorators/roles.decorator';
import { SystemDashboardSeederService } from './system-dashboard-seeder.service';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class SystemDashboardSeederResolver {
  constructor(private seederService: SystemDashboardSeederService) {}

  @Mutation(() => String)
  @Roles('ADMIN')
  async startDashboardSeeding(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ) {
    // Normalize date inputs to YYYY-MM-DD for clean UTC boundaries
    const s = new Date(startDate);
    s.setUTCHours(0, 0, 0, 0);
    const e = new Date(endDate);
    e.setUTCHours(23, 59, 59, 999);
    const result = await this.seederService.startSeeding(
      s.toISOString(),
      e.toISOString(),
    );
    return JSON.stringify(result);
  }

  @Mutation(() => String)
  @Roles('ADMIN')
  async stopDashboardSeeding() {
    const result = await this.seederService.stopSeeding();
    return JSON.stringify(result);
  }

  @Query(() => String)
  @Roles('ADMIN')
  async getDashboardSeedingStatus() {
    const status = this.seederService.getSeedingStatus();
    return JSON.stringify(status);
  }
}
