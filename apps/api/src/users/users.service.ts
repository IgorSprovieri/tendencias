import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { excludePassword, SafeUser } from './users.types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  async findByEmail(email: string) {
    return this.prisma.userEntity.findUnique({
      where: { email: this.normalizeEmail(email) },
    });
  }

  async findById(id: number) {
    return this.prisma.userEntity.findUnique({ where: { id } });
  }

  async findUserById(id: number) {
    return this.findById(id);
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    github_user: string;
  }): Promise<SafeUser> {
    const existingUser = await this.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const user = await this.prisma.userEntity.create({
      data: {
        ...data,
        email: this.normalizeEmail(data.email),
      },
    });
    return excludePassword(user);
  }

  async update(
    id: number,
    data: { name: string; github_user: string },
  ): Promise<SafeUser> {
    const user = await this.prisma.userEntity.update({
      where: { id },
      data: {
        name: data.name.trim(),
        github_user: data.github_user.trim(),
      },
    });

    return excludePassword(user);
  }
}
