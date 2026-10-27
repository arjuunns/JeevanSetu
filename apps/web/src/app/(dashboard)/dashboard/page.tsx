'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle, Users, FileText, Activity,
  ClipboardList, Stethoscope, Hospital, BarChart3,
  Server, Database, Network, ArrowUpRight,
  CheckCircle2, XCircle, Minus,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { api } from '@/lib/api';
import type { DashboardMetricsView } from '@/lib/types';
import { useTranslation } from '@/context/LanguageContext';

interface HealthStatus {
  status: string;
  dependencies: {
    postgres: 'up' | 'down';
    neo4j: 'up' | 'down';
  };
}

/** Swiss metric tile: top rule + eyebrow label + tabular figure. */
function MetricTile({
  label,
  value,
  hint,
  accent,
  loading,
  alert,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  accent?: 'critical' | 'teal' | 'amber';
  loading?: boolean;
  alert?: boolean;
}) {
  const rule =
    accent === 'critical'
      ? 'border-red-600 dark:border-red-500'
      : accent === 'amber'
        ? 'border-amber-500 dark:border-amber-400'
        : 'border-neutral-900 dark:border-white';
  return (
    <div className={`border-t-2 ${rule} pt-4`}>
      <div className="flex items-center justify-between">
        <span className="eyebrow dark:text-zinc-500">{label}</span>
        {alert ? <AlertTriangle className="h-3.5 w-3.5 text-red-600 animate-pulse" /> : null}
      </div>
      <p className="mt-3 text-4xl font-semibold tracking-tight tabular text-neutral-900 dark:text-white">
        {loading ? <span className="text-neutral-300 dark:text-zinc-700">···</span> : value}
      </p>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-zinc-600">{hint}</p>
    </div>
  );
}

export default function OverviewPage() {
  const { t } = useTranslation();

  // Metrics Query
  const { data, isLoading: isMetricsLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.get<DashboardMetricsView>('/dashboard/metrics'),
  });

  // System Health Query
  const { data: health, isLoading: isHealthLoading } = useQuery<HealthStatus>({
    queryKey: ['system-health'],
    queryFn: () => api.get<HealthStatus>('/health/ready'),
    refetchInterval: 10000, // Poll every 10s
  });

  const rates = [
    {
      label: t('overrideRate'),
      value: isMetricsLoading ? null : Math.round((data?.rates.overrideRate ?? 0) * 100),
      bar: 'bg-neutral-900 dark:bg-white',
      hint: 'Doctor modified or overrode AI recommendation',
    },
    {
      label: 'Avg AI Confidence',
      value: isMetricsLoading ? null : Math.round((data?.rates.avgAiConfidence ?? 0) * 100),
      bar: 'bg-teal-700 dark:bg-teal-500',
      hint: 'Mean clinical LLM confidence index',
    },
    {
      label: t('routingSuccess'),
      value: isMetricsLoading ? null : Math.round((data?.rates.routingSuccessRate ?? 0) * 100),
      bar: 'bg-emerald-500',
      hint: 'Successful hospital referrals matched',
    },
  ];

  const actions = [
    { href: '/intake', icon: ClipboardList, title: 'Register Intake', desc: 'Capture patient details and vitals', num: '01' },
    { href: '/review', icon: Stethoscope, title: 'Doctor Review', desc: 'Approve or modify AI assessments', num: '02' },
    { href: '/hospitals', icon: Hospital, title: 'Hospitals Directory', desc: 'Check resource specs & capacities', num: '03' },
    { href: '/analytics', icon: BarChart3, title: 'CMO Analytics', desc: 'Analyze clinical flow dashboards', num: '04' },
  ];

  const deps = [
    {
      icon: Database,
      name: 'Relational Database',
      sub: 'PostgreSQL (Prisma client)',
      up: health?.dependencies.postgres === 'up',
      loading: isHealthLoading,
    },
    {
      icon: Network,
      name: 'Knowledge Graph',
      sub: 'Neo4j routing engine',
      up: health?.dependencies.neo4j === 'up',
      loading: isHealthLoading,
    },
  ];

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow mb-2 dark:text-zinc-500">/ Shift overview</p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">{t('overview')}</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-zinc-400">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
          {isHealthLoading ? (
            <span className="text-neutral-400">checking systems…</span>
          ) : health?.status === 'ok' || health?.dependencies.postgres === 'up' ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 dark:text-emerald-400">systems nominal</span>
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5 text-red-600 animate-pulse" />
              <span className="text-red-700 dark:text-red-400">degraded</span>
            </>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/40 p-4 text-sm text-amber-800 dark:text-amber-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Could not load live dashboard metrics. Check server connectivity or sign in.</span>
        </div>
      ) : null}

      {/* Hero stats — editorial rule tiles */}
      <section className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label={t('totalPatients')} value={data?.totals.patients ?? 0} hint="All patient intake admissions" loading={isMetricsLoading} />
        <MetricTile
          label={t('criticalPatients')}
          value={data?.totals.criticalPatients ?? 0}
          hint="Requires immediate attending review"
          accent={data?.totals.criticalPatients ? 'critical' : undefined}
          alert={!!data?.totals.criticalPatients}
          loading={isMetricsLoading}
        />
        <MetricTile label={t('referralCount')} value={data?.totals.referrals ?? 0} hint="Active clinical referral records" loading={isMetricsLoading} />
        <MetricTile label={t('activeAlerts')} value={data?.totals.activeAlerts ?? 0} hint="System alerts flagged" accent="amber" loading={isMetricsLoading} />
      </section>

      {/* Rates */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Minus className="w-4 h-4 text-teal-700 dark:text-teal-500" />
          <h2 className="eyebrow dark:text-zinc-500">Core Operational Rates</h2>
        </div>
        <div className="card grid gap-6 sm:grid-cols-3 p-6">
          {rates.map((r) => (
            <div key={r.label}>
              <div className="flex items-baseline justify-between">
                <span className="eyebrow dark:text-zinc-500">{r.label}</span>
                <span className="text-2xl font-semibold tracking-tight tabular text-neutral-900 dark:text-white">
                  {r.value === null ? '···' : `${r.value}%`}
                </span>
              </div>
              <div className="mt-3 h-1 w-full bg-neutral-100 dark:bg-zinc-800 overflow-hidden rounded-full">
                <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${(r.value ?? 0) * 1.02}%` }} />
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-zinc-600">{r.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Actions + Infrastructure */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Minus className="w-4 h-4 text-teal-700 dark:text-teal-500" />
            <h2 className="eyebrow dark:text-zinc-500">Quick Actions</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200 rounded-lg overflow-hidden dark:bg-zinc-800 dark:border-zinc-800">
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group bg-white hover:bg-neutral-50 p-5 transition-colors dark:bg-zinc-900 dark:hover:bg-zinc-800/70"
              >
                <div className="flex items-center justify-between mb-6">
                  <a.icon className="h-4.5 w-4.5 text-neutral-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors" strokeWidth={1.75} />
                  <ArrowUpRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all dark:group-hover:text-white" />
                </div>
                <span className="font-mono text-[10px] text-neutral-300 dark:text-zinc-600">{a.num}</span>
                <h3 className="font-semibold tracking-tight text-sm text-neutral-900 dark:text-white mt-0.5">{a.title}</h3>
                <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-zinc-500 mt-1">{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Infrastructure health */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Minus className="w-4 h-4 text-teal-700 dark:text-teal-500" />
            <h2 className="eyebrow dark:text-zinc-500">System Health</h2>
          </div>
          <div className="card divide-y divide-neutral-100 dark:divide-zinc-800 p-0 overflow-hidden">
            {deps.map((d) => (
              <div key={d.name} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <d.icon className="h-4 w-4 text-neutral-400 dark:text-zinc-500" strokeWidth={1.75} />
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-zinc-100">{d.name}</h3>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-zinc-500">{d.sub}</p>
                  </div>
                </div>
                {d.loading ? (
                  <span className="w-2 h-2 rounded-full bg-neutral-300 animate-pulse" />
                ) : d.up ? (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Up
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-red-600 animate-pulse">
                    <XCircle className="h-3.5 w-3.5" /> Down
                  </span>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-50/60 dark:bg-zinc-950/40">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                <Server className="h-3 w-3" /> Auto-refresh
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-zinc-500">10s intervals</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
