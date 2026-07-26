import api from './api';

export interface ExternalLink {
  id: number;
  platform: string;
  username: string;
  profile_url: string | null;
  is_verified: boolean;
  synced_at: string | null;
}

export interface PlatformStat {
  platform: string;
  username: string;
  profile_url: string | null;
  total: number;
  accepted: number;
  synced_at: string | null;
}

export interface ExternalStats {
  linked_platforms: PlatformStat[];
  total_submissions: number;
  accepted_submissions: number;
}

export const externalApi = {
  link: (platform: string, username: string) =>
    api.post('/external/link', { platform, username }),

  listAccounts: () =>
    api.get<ExternalLink[]>('/external/accounts'),

  sync: () =>
    api.post<{ synced: Record<string, number> }>('/external/sync'),

  stats: () =>
    api.get<ExternalStats>('/external/stats'),

  unlink: (id: number) =>
    api.delete(`/external/accounts/${id}`),
};
