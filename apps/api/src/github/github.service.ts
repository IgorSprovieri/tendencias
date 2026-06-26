import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import {
  GitHubActivityDay,
  GitHubActivityType,
  GitHubEntity,
  GitHubLanguage,
  GitHubRepo,
} from './github.entity';
import { GithubRepository } from './github.repository';

type GithubApiUser = {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  email: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
};

type GithubApiRepo = {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
};

type GithubApiEvent = {
  created_at: string;
  type: string;
};

const ACTIVITY_DAYS = 30;
const REPOS_FOR_LANGUAGES = 30;

@Injectable()
export class GithubService {
  constructor(
    private readonly usersService: UsersService,
    private readonly githubRepository: GithubRepository,
    private readonly configService: ConfigService,
  ) {}

  async search(githubUser: string, userId: number): Promise<GitHubEntity> {
    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const normalizedGithubUser = githubUser.trim();
    const cachedData = await this.githubRepository.getGithubData(String(userId));

    if (
      cachedData &&
      cachedData.top_activities !== undefined &&
      cachedData.login.toLowerCase() === normalizedGithubUser.toLowerCase()
    ) {
      return cachedData;
    }

    try {
      const githubData = await this.findInGithubApi(normalizedGithubUser);
      await this.githubRepository.saveGithubData(String(userId), githubData);
      return githubData;
    } catch (error) {
      if (
        cachedData &&
        cachedData.top_activities !== undefined &&
        cachedData.login.toLowerCase() === normalizedGithubUser.toLowerCase()
      ) {
        return cachedData;
      }

      throw error;
    }
  }

  private async findInGithubApi(githubUser: string): Promise<GitHubEntity> {
    const headers = this.buildHeaders();

    const [profile, repos, events] = await Promise.all([
      this.fetchUserProfile(githubUser, headers),
      this.fetchRepos(githubUser, headers),
      this.fetchEvents(githubUser, headers),
    ]);

    const topRepos = this.mapTopRepos(repos);
    const languages = await this.aggregateLanguages(
      githubUser,
      repos.slice(0, REPOS_FOR_LANGUAGES),
      headers,
    );
    const activity = this.buildActivityTimeline(events);
    const topActivities = this.buildTopActivities(events);

    return {
      login: profile.login,
      id: profile.id,
      avatar_url: profile.avatar_url,
      html_url: profile.html_url,
      name: profile.name,
      email: profile.email,
      company: profile.company,
      location: profile.location,
      bio: profile.bio,
      public_repos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      created_at: profile.created_at,
      top_repos: topRepos,
      languages,
      activity,
      top_activities: topActivities,
    };
  }

  private buildHeaders(): HeadersInit {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    const headers: HeadersInit = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'tendencias-api',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async fetchUserProfile(
    githubUser: string,
    headers: HeadersInit,
  ): Promise<GithubApiUser> {
    const response = await fetch(`https://api.github.com/users/${githubUser}`, {
      headers,
    });

    if (response.status === 404) {
      throw new NotFoundException('Dados do GitHub não encontrados');
    }

    if (!response.ok) {
      throw new ServiceUnavailableException('Falha ao consultar a API do GitHub');
    }

    return response.json() as Promise<GithubApiUser>;
  }

  private async fetchRepos(
    githubUser: string,
    headers: HeadersInit,
  ): Promise<GithubApiRepo[]> {
    const response = await fetch(
      `https://api.github.com/users/${githubUser}/repos?sort=stars&direction=desc&per_page=100`,
      { headers },
    );

    if (!response.ok) {
      throw new ServiceUnavailableException(
        'Falha ao consultar repositórios do GitHub',
      );
    }

    return response.json() as Promise<GithubApiRepo[]>;
  }

  private async fetchEvents(
    githubUser: string,
    headers: HeadersInit,
  ): Promise<GithubApiEvent[]> {
    const events: GithubApiEvent[] = [];

    for (let page = 1; page <= 3; page++) {
      const response = await fetch(
        `https://api.github.com/users/${githubUser}/events/public?per_page=100&page=${page}`,
        { headers },
      );

      if (!response.ok) {
        break;
      }

      const pageEvents = (await response.json()) as GithubApiEvent[];
      if (pageEvents.length === 0) {
        break;
      }

      events.push(...pageEvents);

      const lastEvent = pageEvents[pageEvents.length - 1];
      if (!lastEvent) {
        break;
      }

      const oldestEvent = new Date(lastEvent.created_at);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - ACTIVITY_DAYS);

      if (oldestEvent < cutoff) {
        break;
      }
    }

    return events;
  }

  private mapTopRepos(repos: GithubApiRepo[]): GitHubRepo[] {
    return [...repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3)
      .map((repo) => ({
        name: repo.name,
        html_url: repo.html_url,
        description: repo.description,
        stargazers_count: repo.stargazers_count,
        language: repo.language,
      }));
  }

  private async aggregateLanguages(
    githubUser: string,
    repos: GithubApiRepo[],
    headers: HeadersInit,
  ): Promise<GitHubLanguage[]> {
    const totals = new Map<string, number>();

    await Promise.all(
      repos.map(async (repo) => {
        const response = await fetch(
          `https://api.github.com/repos/${githubUser}/${repo.name}/languages`,
          { headers },
        );

        if (!response.ok) {
          return;
        }

        const languages = (await response.json()) as Record<string, number>;
        for (const [name, bytes] of Object.entries(languages)) {
          totals.set(name, (totals.get(name) ?? 0) + bytes);
        }
      }),
    );

    const totalBytes = Array.from(totals.values()).reduce(
      (sum, bytes) => sum + bytes,
      0,
    );

    if (totalBytes === 0) {
      return [];
    }

    return Array.from(totals.entries())
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: Math.round((bytes / totalBytes) * 100),
      }))
      .sort((a, b) => b.bytes - a.bytes);
  }

  private buildTopActivities(events: GithubApiEvent[]): GitHubActivityType[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - ACTIVITY_DAYS);
    cutoff.setHours(0, 0, 0, 0);

    const counts = new Map<string, number>();

    for (const event of events) {
      const eventDate = new Date(event.created_at);
      if (eventDate < cutoff) {
        continue;
      }

      counts.set(event.type, (counts.get(event.type) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }

  private buildActivityTimeline(events: GithubApiEvent[]): GitHubActivityDay[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - ACTIVITY_DAYS);
    cutoff.setHours(0, 0, 0, 0);

    const counts = new Map<string, number>();

    for (let i = ACTIVITY_DAYS - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      counts.set(this.formatDate(date), 0);
    }

    for (const event of events) {
      const eventDate = new Date(event.created_at);
      if (eventDate < cutoff) {
        continue;
      }

      const dateKey = this.formatDate(eventDate);
      if (counts.has(dateKey)) {
        counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
  }
}
