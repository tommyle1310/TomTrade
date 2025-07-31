import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    if (!request.user) {
      return false;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: request.user.id },
    });

    if (!user) {
      return false;
    }

    // Check if user is banned
    if (user.isBanned) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
