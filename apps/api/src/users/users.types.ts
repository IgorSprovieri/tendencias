import { UserEntity } from '@prisma/client';

export type SafeUser = Omit<UserEntity, "password">;

export function excludePassword(user: UserEntity): SafeUser {
  const { password: _, ...safeUser } = user;
  return safeUser;
}
