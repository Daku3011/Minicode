'use client';

import { ExternalLink } from '@/lib/external-api';
import { CheckCircle, ExternalLink as ExternalLinkIcon, Trash2, RefreshCw, Code2, BookOpen, Trophy } from 'lucide-react';

const platformConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  codeforces: { label: 'Codeforces', color: 'text-red-600 bg-red-50 border-red-200', icon: <Code2 className="w-5 h-5" /> },
  leetcode: { label: 'LeetCode', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: <BookOpen className="w-5 h-5" /> },
  hackerrank: { label: 'HackerRank', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <Trophy className="w-5 h-5" /> },
};

interface ExternalPlatformCardProps {
  link: ExternalLink;
  onSync: (platform: string) => void;
  onUnlink: (id: number) => void;
  syncing?: boolean;
}

export default function ExternalPlatformCard({ link, onSync, onUnlink, syncing }: ExternalPlatformCardProps) {
  const config = platformConfig[link.platform] || { label: link.platform, color: 'text-gray-600 bg-gray-50 border-gray-200', icon: <Code2 className="w-5 h-5" /> };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-blue-100 rounded-xl shadow-blue-sm">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-lg border ${config.color}`}>
          {config.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{config.label}</h3>
            {link.is_verified && (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <p className="text-sm text-slate-500">@{link.username}</p>
          {link.profile_url && (
            <a
              href={link.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-0.5"
            >
              View profile <ExternalLinkIcon className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSync(link.platform)}
          disabled={syncing}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
          title="Sync submissions"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={() => onUnlink(link.id)}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          title="Unlink account"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
