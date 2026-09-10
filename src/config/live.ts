import raw from '../../data/cache/live.json';

export type GithubLive = {
  repo: string;
  repoUrl: string;
  message: string | null;
  date: string;
  stale?: boolean;
};

const data = raw as { github?: GithubLive };

export const githubLive: GithubLive | null = data.github ?? null;