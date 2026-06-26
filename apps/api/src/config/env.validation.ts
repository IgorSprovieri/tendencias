import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  validateSync,
} from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(16)
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRES_IN!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsUrl({ require_tld: false })
  CORS_ORIGIN!: string;

  @IsString()
  @IsOptional()
  GITHUB_TOKEN?: string;

  @IsString()
  @IsOptional()
  PORT?: string;

  @IsString()
  @IsOptional()
  BCRYPT_ROUNDS?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      errors
        .map((error) => Object.values(error.constraints ?? {}).join(', '))
        .join('; '),
    );
  }

  if (
    validated.NODE_ENV === NodeEnv.Production &&
    validated.JWT_SECRET.length < 32
  ) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }

  return validated;
}
