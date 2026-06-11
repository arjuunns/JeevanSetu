'use client';

import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

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

import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/Skeleton';
import { api } from '@/lib/api';
import type { DashboardMetricsView } from '@/lib/types';
import { useTranslation } from '@/context/LanguageContext';

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#b91c1c',
  HIGH: '#ea580c',
  MODERATE: '#ca8a04',
  LOW: '#16a34a',
};

/** Phase 14 — CMO analytics with charts (severity distribution, referral trend, occupancy). */
export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.get<DashboardMetricsView>('/dashboard/metrics'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{t('cmoDashboard')}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('cmoSubtitle')}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <StatCard
          label={t('averageTriageTime')}
          value={isLoading ? <Skeleton className="h-8 w-16 my-1" /> : (data?.rates.avgTriageSeconds != null ? `${data.rates.avgTriageSeconds}s` : '—')}
        />
        <StatCard
          label={t('overrideRate')}
          value={isLoading ? <Skeleton className="h-8 w-16 my-1" /> : `${Math.round((data?.rates.overrideRate ?? 0) * 100)}%`}
        />
        <StatCard
          label="Avg AI confidence"
          value={isLoading ? <Skeleton className="h-8 w-16 my-1" /> : `${Math.round((data?.rates.avgAiConfidence ?? 0) * 100)}%`}
        />
        <StatCard
          label={t('routingSuccess')}
          value={isLoading ? <Skeleton className="h-8 w-16 my-1" /> : `${Math.round((data?.rates.routingSuccessRate ?? 0) * 100)}%`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 font-semibold text-slate-900">{t('severityDistribution')}</h3>
          {isLoading ? (
            <Skeleton className="w-full h-[260px]" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data?.severityDistribution ?? []} dataKey="count" nameKey="severity" outerRadius={90} label>
                  {(data?.severityDistribution ?? []).map((entry) => (
                    <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] ?? '#64748b'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="mb-3 font-semibold text-slate-900">{t('referralTrends')}</h3>
          {isLoading ? (
            <Skeleton className="w-full h-[260px]" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data?.referralTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card lg:col-span-2">
          <h3 className="mb-3 font-semibold text-slate-900">{t('hospitalLoad')}</h3>
          {isLoading ? (
            <Skeleton className="w-full h-[300px]" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.hospitalOccupancy ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Bar dataKey="occupancyPct" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

