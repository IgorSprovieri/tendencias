export type GitHubRepo = {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
};

export type GitHubLanguage = {
  name: string;
  bytes: number;
  percentage: number;
};

export type GitHubActivityDay = {
  date: string;
  count: number;
};

export type GitHubActivityType = {
  type: string;
  count: number;
};

export type GitHubEntity = {
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
  top_repos: GitHubRepo[];
  languages: GitHubLanguage[];
  activity: GitHubActivityDay[];
  top_activities: GitHubActivityType[];
};
