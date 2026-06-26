import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @MaxLength(36)
  refresh_token!: string;
}
