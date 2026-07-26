'use client';

import { useEffect, useState } from 'react';
import { externalApi, ExternalLink, ExternalStats } from '@/lib/external-api';
import ExternalPlatformCard from '@/components/ExternalPlatformCard';
import { ArrowLeft, RefreshCw, Link2, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const platforms = [
  { value: 'codeforces', label: 'Codeforces' },
  { value: 'leetcode', label: 'LeetCode' },
  { value: 'hackerrank', label: 'HackerRank' },
];

export default function IntegrationsPage() {
  const [accounts, setAccounts] = useState<ExternalLink[]>([]);
  const [stats, setStats] = useState<ExternalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [platform, setPlatform] = useState('codeforces');
  const [username, setUsername] = useState('');
  const [linking, setLinking] = useState(false);
  const [syncPlatform, setSyncPlatform] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [accRes, statsRes] = await Promise.all([
        externalApi.listAccounts(),
        externalApi.stats(),
      ]);
      setAccounts(accRes.data as unknown as ExternalLink[]);
      setStats(statsRes.data as ExternalStats);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLink = async () => {
    if (!username.trim()) return;
    setLinking(true);
    try {
      await externalApi.link(platform, username.trim());
      setUsername('');
      await fetchData();
    } catch (err) {
      console.error('Failed to link account:', err);
    } finally {
      setLinking(false);
    }
  };

  const handleSync = async (p: string) => {
    setSyncPlatform(p);
    try {
      await externalApi.sync();
      await fetchData();
    } catch (err) {
      console.error('Failed to sync:', err);
    } finally {
      setSyncPlatform(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      await externalApi.sync();
      await fetchData();
    } catch (err) {
      console.error('Failed to sync all:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleUnlink = async (id: number) => {
    try {
      await externalApi.unlink(id);
      await fetchData();
    } catch (err) {
      console.error('Failed to unlink:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <Link2 className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
            <p className="text-slate-500 text-sm mt-1">Connect your coding profiles from other platforms</p>
          </div>
        </div>

        {/* Link New Account */}
        <div className="bg-white rounded-2xl border border-blue-100 p-6 mb-8 shadow-blue-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Link a New Account</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-4 py-2.5 border border-blue-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username on that platform"
              className="flex-1 px-4 py-2.5 border border-blue-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            <button
              onClick={handleLink}
              disabled={linking || !username.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200"
            >
              {linking ? 'Linking...' : 'Link Account'}
            </button>
          </div>
        </div>

        {/* Linked Accounts */}
        <div className="bg-white rounded-2xl border border-blue-100 p-6 mb-8 shadow-blue-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Linked Accounts</h2>
            {accounts.length > 0 && (
              <button
                onClick={handleSyncAll}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                Sync All
              </button>
            )}
          </div>
          {accounts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No accounts linked yet. Link one above!</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc) => (
                <ExternalPlatformCard
                  key={acc.id}
                  link={acc}
                  onSync={handleSync}
                  onUnlink={handleUnlink}
                  syncing={syncPlatform === acc.platform}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cross-Platform Stats */}
        {stats && stats.linked_platforms.length > 0 && (
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-blue-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Cross-Platform Stats</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <p className="text-2xl font-bold text-blue-700">{stats.total_submissions}</p>
                <p className="text-xs text-slate-500 mt-1">Total Submissions</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                <p className="text-2xl font-bold text-emerald-700">{stats.accepted_submissions}</p>
                <p className="text-xs text-slate-500 mt-1">Accepted</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                <p className="text-2xl font-bold text-amber-700">
                  {stats.total_submissions > 0
                    ? Math.round((stats.accepted_submissions / stats.total_submissions) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-slate-500 mt-1">Acceptance Rate</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
