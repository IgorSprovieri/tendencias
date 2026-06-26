import { getAccessToken } from "./session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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

export type GitHubData = {
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

export async function fetchGithubData(): Promise<GitHubData | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${API_URL}/github`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<GitHubData>;
}
