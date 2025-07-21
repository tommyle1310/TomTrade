import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { AuthPayload, LoginInput, SignUpInput } from "./dto/auth.payload.dto";
import { User } from "src/user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signUp(dto: SignUpInput): Promise<AuthPayload> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email }});
    if (existing) throw new BadRequestException('Email already registered');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash: hash },
    });
    return this.buildPayload(user);
  }

  async login(dto: LoginInput): Promise<AuthPayload> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email }});
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildPayload(user);
  }

  private buildPayload(user: User): AuthPayload {
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    return { accessToken, user };
  }
}
