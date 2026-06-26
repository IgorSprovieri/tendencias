import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SafeUser } from '../users/users.types';
import { GithubService } from './github.service';

@Controller('github')
@UseGuards(JwtAuthGuard)
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get()
  getGithubData(@CurrentUser() user: SafeUser) {
    return this.githubService.search(user.github_user, user.id);
  }
}
