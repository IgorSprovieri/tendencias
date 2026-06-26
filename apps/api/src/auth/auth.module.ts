import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: false }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.getOrThrow<string>('JWT_EXPIRES_IN');
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        const expiresInSeconds = match
          ? (() => {
              const value = Number(match[1]);
              switch (match[2]) {
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
            })()
          : 900;

        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expiresInSeconds,
            algorithm: 'HS256' as const,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
