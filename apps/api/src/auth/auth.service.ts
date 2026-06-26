import { UserEntity } from '@prisma/client';
import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { UsersService } from '../users/users.service';
import { excludePassword, SafeUser } from '../users/users.types';
import { DUMMY_PASSWORD_HASH, REFRESH_TOKEN_PREFIX } from './auth.constants';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type AuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

@Injectable()
export class AuthService {
  private readonly bcryptRounds: number;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenTtlSeconds: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    this.bcryptRounds = Number(this.configService.get('BCRYPT_ROUNDS', 12));
    this.accessTokenExpiresIn = this.configService.getOrThrow('JWT_EXPIRES_IN');
    this.refreshTokenTtlSeconds = this.parseDurationToSeconds(
      this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
    );
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.bcryptRounds,
    );
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    return this.buildAuthResponse(user);
  }

  async signIn(user: UserEntity) {
    return this.buildAuthResponse(excludePassword(user));
  }

  async refresh(refreshToken: string) {
    const userId = await this.consumeRefreshToken(refreshToken);

    if (!userId) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return this.buildAuthResponse(excludePassword(user));
  }

  async logout(refreshToken: string) {
    await this.redis.del(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);
  }

  async updateProfile(userId: number, updateUserDto: UpdateUserDto) {
    const currentUser = await this.usersService.findUserById(userId);

    if (!currentUser) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return this.usersService.update(userId, updateUserDto);
  }

  async validateUser(email: string, password: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.usersService.findByEmail(normalizedEmail);
    const hashToCompare = user?.password ?? DUMMY_PASSWORD_HASH;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return user;
  }

  private async buildAuthResponse(user: SafeUser) {
    const tokens = await this.issueTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  private async issueTokens(user: SafeUser): Promise<AuthTokens> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: this.parseDurationToSeconds(this.accessTokenExpiresIn),
    };
  }

  private async generateAccessToken(user: SafeUser) {
    const payload = { sub: user.id, email: user.email };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.parseDurationToSeconds(this.accessTokenExpiresIn),
      algorithm: 'HS256',
    });
  }

  private async createRefreshToken(userId: number) {
    const refreshToken = randomUUID();
    await this.redis.set(
      `${REFRESH_TOKEN_PREFIX}${refreshToken}`,
      String(userId),
      'EX',
      this.refreshTokenTtlSeconds,
    );

    return refreshToken;
  }

  private async consumeRefreshToken(refreshToken: string) {
    const key = `${REFRESH_TOKEN_PREFIX}${refreshToken}`;
    const userId = await this.redis.get(key);

    if (!userId) {
      return null;
    }

    await this.redis.del(key);
    return Number(userId);
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private parseDurationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 900;
    }

    const value = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return 900;
    }
  }
}
