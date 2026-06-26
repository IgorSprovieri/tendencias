import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { GithubController } from './github.controller';
import { GithubRepository } from './github.repository';
import { GithubService } from './github.service';

@Module({
  imports: [UsersModule],
  controllers: [GithubController],
  providers: [GithubService, GithubRepository],
  exports: [GithubRepository],
})
export class GithubModule {}
