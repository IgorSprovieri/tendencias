import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { GitHubEntity } from './github.entity';

const CACHE_TTL_SECONDS = 30 * 60;
const CACHE_KEY_PREFIX = 'github:user:';

@Injectable()
export class GithubRepository {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async saveGithubData(userId: string, data: GitHubEntity): Promise<void> {
    const key = this.getCacheKey(userId);
    await this.redis.set(key, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS);
  }

  async deleteGithubData(userId: string): Promise<void> {
    await this.redis.del(this.getCacheKey(userId));
  }

  async getGithubData(userId: string): Promise<GitHubEntity | null> {
    const key = this.getCacheKey(userId);
    const cached = await this.redis.get(key);

    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as GitHubEntity;
  }

  private getCacheKey(userId: string): string {
    return `${CACHE_KEY_PREFIX}${userId}`;
  }
}
