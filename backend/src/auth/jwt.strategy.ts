import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "src/user/entities/user.entity";

// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService, config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:  config.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }});
    if (!user) throw new UnauthorizedException('Invalid token');
    return user;
  }
}
