'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Minus, PieChartIcon, BarChart3 } from 'lucide-react';

import { Skeleton } from '@/components/Skeleton';
import { api } from '@/lib/api';
import type { DashboardMetricsView } from '@/lib/types';
import { useTranslation } from '@/context/LanguageContext';

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MODERATE: '#ca8a04',
  LOW: '#16a34a',
};

/** Swiss metric tile: top rule + eyebrow label + tabular figure. */
function Tile({
  label,
  value,
  hint,
  accent,
  isLoading,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  accent?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className={`border-t-2 pt-4 ${accent ? 'border-red-600 dark:border-red-500' : 'border-neutral-900 dark:border-white'}`}>
      <p className="eyebrow dark:text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular text-neutral-900 dark:text-white">
        {isLoading ? <span className="text-neutral-300 dark:text-zinc-700">···</span> : value}
      </p>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-zinc-600">{hint}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CLINICAL' | 'OPERATIONS'>('OVERVIEW');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.get<DashboardMetricsView>('/dashboard/metrics'),
  });

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview Metrics', icon: Activity },
    { id: 'CLINICAL', label: 'Clinical Severity', icon: PieChartIcon },
    { id: 'OPERATIONS', label: 'Operational Load', icon: BarChart3 },
  ] as const;

  return (
    <div className="animate-fade-in max-w-6xl">
      {/* Header */}
      <div>
        <p className="eyebrow mb-2 dark:text-zinc-500">/ Chief Medical Officer</p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">{t('cmoDashboard')}</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-zinc-400">{t('cmoSubtitle')}</p>
      </div>

      {/* Tabs — underline style */}
      <div className="flex border-b border-neutral-200 dark:border-zinc-800 mt-8 mb-8 gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-2.5 text-sm border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-neutral-900 font-semibold text-neutral-900 dark:border-white dark:text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-800 dark:text-zinc-500 dark:hover:text-zinc-200'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-10 animate-scale-in">
          <section className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            <Tile label="Total Patients" value={data?.totals.patients ?? 0} hint="All patient intake admissions" isLoading={isLoading} />
            <Tile label="Critical Cases" value={data?.totals.criticalPatients ?? 0} hint="Requires immediate attending review" accent={!!data?.totals.criticalPatients} isLoading={isLoading} />
            <Tile label="Referrals Routed" value={data?.totals.referrals ?? 0} hint="Active clinical referral records" isLoading={isLoading} />
            <Tile label="Avg Triage Time" value={isLoading ? '—' : data?.rates.avgTriageSeconds != null ? `${data.rates.avgTriageSeconds}s` : '—'} hint="Total API roundtrip latency" isLoading={isLoading} />
          </section>

          <section className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            <Tile label={t('overrideRate')} value={`${Math.round((data?.rates.overrideRate ?? 0) * 100)}%`} hint="Human modifications to AI severity" isLoading={isLoading} />
            <Tile label="Avg AI Confidence" value={`${Math.round((data?.rates.avgAiConfidence ?? 0) * 100)}%`} hint="Average model confidence score" isLoading={isLoading} />
            <Tile label={t('routingSuccess')} value={`${Math.round((data?.rates.routingSuccessRate ?? 0) * 100)}%`} hint="Successful smart hospital routes" isLoading={isLoading} />
          </section>
        </div>
      )}

      {/* TAB 2: CLINICAL SEVERITY */}
      {activeTab === 'CLINICAL' && (
        <div className="grid gap-6 lg:grid-cols-3 animate-scale-in">
          <div className="card lg:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold tracking-tight text-neutral-900 dark:text-white">{t('severityDistribution')}</h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                Percentage breakdown of triage severity categories
              </p>
            </div>
            <div className="h-[280px] mt-6">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data?.severityDistribution ?? []} dataKey="count" nameKey="severity" outerRadius={90} label>
                      {(data?.severityDistribution ?? []).map((entry) => (
                        <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] ?? '#737373'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="card flex flex-col">
            <h3 className="mb-4 font-semibold tracking-tight text-neutral-900 dark:text-white">Severity Details</h3>
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-32" />
              ) : (
                (data?.severityDistribution ?? []).map((item) => (
                  <div key={item.severity} className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[item.severity] }}></span>
                      <span className="badge border border-neutral-200 text-neutral-600 dark:border-zinc-700 dark:text-zinc-400">{item.severity}</span>
                    </div>
                    <span className="text-sm font-semibold tabular text-neutral-900 dark:text-white">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONAL LOAD */}
      {activeTab === 'OPERATIONS' && (
        <div className="space-y-6 animate-scale-in">
          <div className="flex items-center gap-3">
            <Minus className="w-4 h-4 text-teal-700 dark:text-teal-500" />
            <h2 className="eyebrow dark:text-zinc-500">14-Day Operational Trend</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card">
              <h3 className="mb-1 font-semibold tracking-tight text-neutral-900 dark:text-white">{t('referralTrends')}</h3>
              <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-zinc-500 mb-4">
                Total referrals executed daily · past 14 days
              </p>
              {isLoading ? (
                <Skeleton className="w-full h-[260px]" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data?.referralTrend ?? []}>
                    <CartesianGrid strokeDasharray="1 4" stroke="#d4d4d4" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#a3a3a3' }} axisLine={{ stroke: '#e5e5e5' }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#a3a3a3' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card">
              <h3 className="mb-1 font-semibold tracking-tight text-neutral-900 dark:text-white">{t('hospitalLoad')}</h3>
              <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-zinc-500 mb-4">
                Network hospital occupancy · real-time
              </p>
              {isLoading ? (
                <Skeleton className="w-full h-[260px]" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data?.hospitalOccupancy ?? []}>
                    <CartesianGrid strokeDasharray="1 4" stroke="#d4d4d4" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#a3a3a3' }} axisLine={{ stroke: '#e5e5e5' }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#a3a3a3' }} unit="%" axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="occupancyPct" radius={[2, 2, 0, 0]}>
                      {(data?.hospitalOccupancy ?? []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.occupancyPct > 80 ? '#dc2626' : '#0f766e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
