import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SystemDashboardService } from './system-dashboard.service';
import { SystemDashboardResult } from './entities/system-dashboard.entity';
import { SystemDashboardInput } from './dto/system-dashboard.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class SystemDashboardResolver {
  constructor(private systemDashboardService: SystemDashboardService) {}

  @Query(() => SystemDashboardResult)
  async getSystemDashboard(
    @Args('input') input: SystemDashboardInput,
    @CurrentUser() user: { id: string; role?: string },
  ): Promise<SystemDashboardResult> {
    // TODO: Add admin role check
    // if (user.role !== 'ADMIN') {
    //   throw new UnauthorizedException('Admin access required');
    // }

    console.log(
      `🔍 SystemDashboardResolver.getSystemDashboard called for user: ${user.id}`,
    );
    const result = await this.systemDashboardService.getSystemDashboard(input);
    return result;
  }
}
