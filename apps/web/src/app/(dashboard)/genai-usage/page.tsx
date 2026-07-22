'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import {
  Activity,
  Cpu,
  Clock,
  Coins,
  AlertOctagon,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';

interface GenAiLog {
  id: string;
  timestamp: string;
  feature: string;
  model: string;
  latencyMs: number;
  status: 'SUCCESS' | 'FAILED';
  promptTokens?: number;
  responseTokens?: number;
  totalTokens?: number;
  errorMessage?: string;
}

interface GenAiUsageData {
  summary: {
    totalRequests: number;
    successRequests: number;
    failedRequests: number;
    successRate: number;
    rateLimitHits: number;
    totalTokens: number;
    totalPromptTokens: number;
    totalResponseTokens: number;
    avgLatencyMs: number;
  };
  byFeature: Record<
    string,
    { count: number; success: number; failed: number; totalTokens: number; avgLatencyMs: number }
  >;
  byModel: Record<string, number>;
  logs: GenAiLog[];
}

export default function GenAiUsagePage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [featureFilter, setFeatureFilter] = useState('ALL');

  const { data, isLoading, refetch, isFetching } = useQuery<GenAiUsageData>({
    queryKey: ['genai-usage'],
    queryFn: () => api.get<GenAiUsageData>('/genai/usage'),
    refetchInterval: 10000, // auto-refresh every 10s
  });

  const filteredLogs = (data?.logs ?? []).filter((log) => {
    const matchesSearch =
      log.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.feature.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.errorMessage && log.errorMessage.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'SUCCESS' && log.status === 'SUCCESS') ||
      (statusFilter === 'FAILED' && log.status === 'FAILED') ||
      (statusFilter === 'RATELIMIT' && log.errorMessage?.includes('rate limit'));

    const matchesFeature = featureFilter === 'ALL' || log.feature === featureFilter;

    return matchesSearch && matchesStatus && matchesFeature;
  });

  const uniqueFeatures = Object.keys(data?.byFeature ?? {});

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">GenAI Usage Metrics</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Real-time telemetry, model latency, token consumption, and API key health.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Activity className="h-8 w-8 animate-pulse text-brand-600" />
          <span className="text-sm text-slate-500 font-medium">Loading metrics...</span>
        </div>
      ) : !data || data.summary.totalRequests === 0 ? (
        <div className="card text-center p-12">
          <Cpu className="h-12 w-12 mx-auto text-slate-300 dark:text-zinc-700 mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-200">No GenAI Activity Yet</h3>
          <p className="text-sm text-slate-550 dark:text-zinc-450 mt-1 max-w-md mx-auto">
            Log telemetry by completing a Patient Voice Intake or performing an AI-assisted Triage assessment.
          </p>
        </div>
      ) : (
        <>
          {/* Key Metrics Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Cards */}
            <div className="card p-4 flex flex-col justify-between hover:shadow-md transition duration-300">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Requests</span>
                <Cpu className="h-4 w-4 text-brand-600" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  {data.summary.totalRequests}
                </span>
              </div>
            </div>

            <div className="card p-4 flex flex-col justify-between hover:shadow-md transition duration-300">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Success Rate</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-emerald-600">
                  {data.summary.successRate.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {data.summary.successRequests} of {data.summary.totalRequests} successful
                </span>
              </div>
            </div>

            <div className="card p-4 flex flex-col justify-between hover:shadow-md transition duration-300">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Latency</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  {(data.summary.avgLatencyMs / 1000).toFixed(2)}s
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Average round-trip response time
                </span>
              </div>
            </div>

            <div className="card p-4 flex flex-col justify-between hover:shadow-md transition duration-300">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Tokens Used</span>
                <Coins className="h-4 w-4 text-sky-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-800 dark:text-white">
                  {data.summary.totalTokens.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  P: {data.summary.totalPromptTokens.toLocaleString()} | R: {data.summary.totalResponseTokens.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="card p-4 flex flex-col justify-between hover:shadow-md transition duration-300">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Rate Limit Hits</span>
                <AlertOctagon className="h-4 w-4 text-rose-600" />
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-black ${data.summary.rateLimitHits > 0 ? 'text-rose-600' : 'text-slate-850 dark:text-zinc-200'}`}>
                  {data.summary.rateLimitHits}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  HTTP 429 quota exceed errors
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature Breakdown Table */}
            <div className="card p-5 md:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-zinc-200">Feature Performance</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-zinc-800 text-sm">
                  <thead>
                    <tr className="text-slate-400 font-semibold text-left">
                      <th className="pb-3">Feature</th>
                      <th className="pb-3 text-center">Requests</th>
                      <th className="pb-3 text-center">Success Rate</th>
                      <th className="pb-3 text-center">Avg Latency</th>
                      <th className="pb-3 text-right">Tokens Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                    {Object.entries(data.byFeature).map(([feature, stats]) => {
                      const fRate = stats.count > 0 ? (stats.success / stats.count) * 100 : 100;
                      return (
                        <tr key={feature} className="text-slate-700 dark:text-zinc-300">
                          <td className="py-3 font-semibold text-xs tracking-wider uppercase text-slate-900 dark:text-white">
                            {feature.replace('_', ' ')}
                          </td>
                          <td className="py-3 text-center">{stats.count}</td>
                          <td className="py-3 text-center">
                            <span className={`font-semibold ${fRate === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {fRate.toFixed(0)}%
                            </span>
                          </td>
                          <td className="py-3 text-center">{(stats.avgLatencyMs / 1000).toFixed(2)}s</td>
                          <td className="py-3 text-right font-mono">{stats.totalTokens.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Distribution */}
            <div className="card p-5 space-y-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-zinc-200">Model Deployment</h2>
              <div className="space-y-3">
                {Object.entries(data.byModel).map(([model, count]) => {
                  const percentage = (count / data.summary.totalRequests) * 100;
                  return (
                    <div key={model} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="font-mono text-slate-650 dark:text-zinc-300">{model}</span>
                        <span className="text-slate-450">{count} calls ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-600 dark:bg-brand-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Logs & Table Section */}
          <div className="card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-zinc-200">Recent Request Telemetry</h2>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-450" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search logs..."
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-zinc-850 dark:bg-zinc-950/40 rounded-lg max-w-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>

                {/* Filter Feature */}
                <select
                  value={featureFilter}
                  onChange={(e) => setFeatureFilter(e.target.value)}
                  className="py-1.5 px-3 border border-slate-200 dark:border-zinc-850 dark:bg-zinc-950/40 rounded-lg text-xs outline-none"
                >
                  <option value="ALL">All Features</option>
                  {uniqueFeatures.map((f) => (
                    <option key={f} value={f}>
                      {f.replace('_', ' ')}
                    </option>
                  ))}
                </select>

                {/* Filter Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-1.5 px-3 border border-slate-200 dark:border-zinc-850 dark:bg-zinc-950/40 rounded-lg text-xs outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="SUCCESS">Success Only</option>
                  <option value="FAILED">Failed Only</option>
                  <option value="RATELIMIT">Rate Limits (429)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-zinc-850 text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold text-left uppercase tracking-wider">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Feature</th>
                    <th className="pb-3">Model</th>
                    <th className="pb-3 text-center">Latency</th>
                    <th className="pb-3 text-center">Tokens</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3">Details / Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-850/60 text-slate-700 dark:text-zinc-350">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No logs matching the current search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/20">
                        <td className="py-3 font-medium">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className="font-semibold px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-[10px] rounded uppercase tracking-wide">
                            {log.feature.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-[10px] text-slate-550 dark:text-zinc-400">
                          {log.model}
                        </td>
                        <td className="py-3 text-center font-semibold">
                          {(log.latencyMs / 1000).toFixed(2)}s
                        </td>
                        <td className="py-3 text-center font-mono text-[10px]">
                          {log.status === 'SUCCESS' ? (
                            <span>P: {log.promptTokens} / R: {log.responseTokens}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {log.status === 'SUCCESS' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                              <CheckCircle className="h-3 w-3" />
                              <span>Success</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                              <XCircle className="h-3 w-3" />
                              <span>Failed</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-slate-500 max-w-sm truncate italic">
                          {log.errorMessage ? (
                            <span className="text-rose-500 font-semibold text-[11px]" title={log.errorMessage}>
                              {log.errorMessage}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-normal">Conformed to schema</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
