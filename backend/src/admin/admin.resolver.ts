import { Resolver, Query, Mutation, Args, UseGuards } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { User } from '@prisma/client';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class AdminResolver {
  constructor(private adminService: AdminService) {}

  @Query(() => [User])
  @Roles('ADMIN')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Query(() => User)
  @Roles('ADMIN')
  async getUserById(@Args('userId') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Mutation(() => User)
  @Roles('ADMIN')
  async banUser(@Args('userId') userId: string) {
    return this.adminService.banUser(userId);
  }

  @Mutation(() => User)
  @Roles('ADMIN')
  async unbanUser(@Args('userId') userId: string) {
    return this.adminService.unbanUser(userId);
  }

  @Mutation(() => User)
  @Roles('ADMIN')
  async promoteToAdmin(@Args('userId') userId: string) {
    return this.adminService.promoteToAdmin(userId);
  }

  @Mutation(() => User)
  @Roles('ADMIN')
  async demoteFromAdmin(@Args('userId') userId: string) {
    return this.adminService.demoteFromAdmin(userId);
  }

  @Query(() => Object)
  @Roles('ADMIN')
  async viewUserPortfolio(@Args('userId') userId: string) {
    return this.adminService.getUserPortfolio(userId);
  }

  @Query(() => Object)
  @Roles('ADMIN')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Query(() => Object)
  @Roles('ADMIN')
  async getRecentActivity(
    @Args('limit', { type: () => Number, defaultValue: 100 }) limit: number,
  ) {
    return this.adminService.getRecentActivity(limit);
  }
}
