'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Users, FileText, Activity } from 'lucide-react';
import * as React from 'react';

import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/Skeleton';
import { api } from '@/lib/api';
import type { DashboardMetricsView } from '@/lib/types';
import { useTranslation } from '@/context/LanguageContext';

export default function OverviewPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.get<DashboardMetricsView>('/dashboard/metrics'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{t('overview')}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>

      {error ? (
        <p className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
          Could not load metrics. Is the API running and are you signed in?
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('totalPatients')} value={fmt(data?.totals.patients, isLoading)} icon={<Users className="h-5 w-5 text-brand-700" />} />
        <StatCard label={t('criticalPatients')} value={fmt(data?.totals.criticalPatients, isLoading)} icon={<AlertTriangle className="h-5 w-5 text-critical" />} />
        <StatCard label={t('referralCount')} value={fmt(data?.totals.referrals, isLoading)} icon={<FileText className="h-5 w-5 text-brand-700" />} />
        <StatCard label={t('activeAlerts')} value={fmt(data?.totals.activeAlerts, isLoading)} icon={<Activity className="h-5 w-5 text-high" />} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label={t('overrideRate')} value={pct(data?.rates.overrideRate, isLoading)} hint="Doctor modified or overrode AI" />
        <StatCard label="Avg AI Confidence" value={pct(data?.rates.avgAiConfidence, isLoading)} hint="Mean across assessments" />
        <StatCard label={t('routingSuccess')} value={pct(data?.rates.routingSuccessRate, isLoading)} hint="Routes with a selected hospital" />
      </div>
    </div>
  );
}

function fmt(n: number | undefined, loading: boolean): React.ReactNode {
  if (loading) return <Skeleton className="h-8 w-16 my-1" />;
  return String(n ?? 0);
}
function pct(n: number | undefined, loading: boolean): React.ReactNode {
  if (loading) return <Skeleton className="h-8 w-20 my-1" />;
  return `${Math.round((n ?? 0) * 100)}%`;
}

