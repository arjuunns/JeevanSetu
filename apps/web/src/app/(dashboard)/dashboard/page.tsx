'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  AlertTriangle, Users, FileText, Activity, 
  ClipboardList, Stethoscope, Hospital, BarChart3, 
  Server, Database, Network, Zap, CheckCircle2, XCircle, ArrowUpRight
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
    redis: 'up' | 'down';
    neo4j: 'up' | 'down';
  };
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t('overview')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{t('subtitle')}</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40 p-4 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Could not load live dashboard metrics. Check server connectivity or sign in.</span>
        </div>
      ) : null}

      {/* Hero Stats Section */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Patients */}
        <div className="relative group overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('totalPatients')}</span>
            <div className="p-2 bg-slate-50 dark:bg-zinc-950 rounded-lg text-brand-600 dark:text-brand-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {isMetricsLoading ? '...' : data?.totals.patients ?? 0}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 font-medium">All patient intake admissions</p>
        </div>

        {/* Critical Cases */}
        <div className="relative group overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('criticalPatients')}</span>
            <div className={`p-2 rounded-lg ${data?.totals.criticalPatients && data.totals.criticalPatients > 0 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-slate-50 dark:bg-zinc-950 text-slate-400'}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {isMetricsLoading ? '...' : data?.totals.criticalPatients ?? 0}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 font-medium">Requires immediate attending review</p>
        </div>

        {/* Active Referrals */}
        <div className="relative group overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('referralCount')}</span>
            <div className="p-2 bg-slate-50 dark:bg-zinc-950 rounded-lg text-emerald-600 dark:text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {isMetricsLoading ? '...' : data?.totals.referrals ?? 0}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 font-medium">Active clinical referral records</p>
        </div>

        {/* Active Alert Notifications */}
        <div className="relative group overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('activeAlerts')}</span>
            <div className="p-2 bg-slate-50 dark:bg-zinc-950 rounded-lg text-amber-600 dark:text-amber-400">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {isMetricsLoading ? '...' : data?.totals.activeAlerts ?? 0}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 font-medium">System alerts flagged</p>
        </div>
      </div>

      {/* Rates Cards Section */}
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Override Rate */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('overrideRate')}</span>
            <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">Rate</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isMetricsLoading ? '...' : `${Math.round((data?.rates.overrideRate ?? 0) * 100)}%`}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-brand-600 h-full rounded-full" style={{ width: `${(data?.rates.overrideRate ?? 0) * 100}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-450 dark:text-zinc-500 mt-2 font-medium">Doctor modified or overrode AI recommendation</p>
        </div>

        {/* Avg Confidence */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Avg AI Confidence</span>
            <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">Score</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isMetricsLoading ? '...' : `${Math.round((data?.rates.avgAiConfidence ?? 0) * 100)}%`}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(data?.rates.avgAiConfidence ?? 0) * 100}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-450 dark:text-zinc-500 mt-2 font-medium">Mean clinical LLM confidence index</p>
        </div>

        {/* Routing Success */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('routingSuccess')}</span>
            <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">Index</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isMetricsLoading ? '...' : `${Math.round((data?.rates.routingSuccessRate ?? 0) * 100)}%`}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(data?.rates.routingSuccessRate ?? 0) * 100}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-450 dark:text-zinc-500 mt-2 font-medium">Successful hospital referrals matched</p>
        </div>
      </div>

      {/* Main Section split: Actions grid & Infrastructure health */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Actions Grid */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-brand-600" />
            <span>Quick Actions Control</span>
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {/* New Intake */}
            <Link 
              href="/intake"
              className="group p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-900 hover:border-brand-500/40 rounded-xl transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white dark:bg-zinc-900 text-brand-600 dark:text-brand-400 rounded-lg group-hover:scale-105 transition-transform">
                  <ClipboardList className="h-4.5 w-4.5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">Register Intake</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Capture patient details and vitals</p>
              </div>
            </Link>

            {/* Review Queue */}
            <Link 
              href="/review"
              className="group p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-900 hover:border-brand-500/40 rounded-xl transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                  <Stethoscope className="h-4.5 w-4.5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">Doctor Review</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Approve or modify AI assessments</p>
              </div>
            </Link>

            {/* Hospitals Map */}
            <Link 
              href="/hospitals"
              className="group p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-900 hover:border-brand-500/40 rounded-xl transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-105 transition-transform">
                  <Hospital className="h-4.5 w-4.5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">Hospitals Directory</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Check resource specs & capacities</p>
              </div>
            </Link>

            {/* CMO Analytics */}
            <Link 
              href="/analytics"
              className="group p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-900 hover:border-brand-500/40 rounded-xl transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white dark:bg-zinc-900 text-pink-600 dark:text-pink-400 rounded-lg group-hover:scale-105 transition-transform">
                  <BarChart3 className="h-4.5 w-4.5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">CMO Analytics</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Analyze clinical flow dashboards</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Infrastructure health status */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Server className="h-5 w-5 text-brand-600" />
              <span>System Infrastructure Health</span>
            </h2>
            <p className="text-xs text-slate-450 dark:text-zinc-500 mb-5">Downstream dependencies liveness status checks</p>

            <div className="space-y-3.5">
              {/* Relational database */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200/40 dark:border-zinc-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-slate-800 dark:text-zinc-200">Relational Database</h3>
                    <p className="text-[9px] text-slate-400 dark:text-zinc-500">PostgreSQL (Prisma client)</p>
                  </div>
                </div>
                {isHealthLoading ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-pulse"></span>
                ) : health?.dependencies.postgres === 'up' ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-red-650 text-xs font-bold animate-pulse">
                    <XCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                )}
              </div>

              {/* Graph Database */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200/40 dark:border-zinc-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md">
                    <Network className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-slate-800 dark:text-zinc-200">Knowledge Graph</h3>
                    <p className="text-[9px] text-slate-400 dark:text-zinc-500">Neo4j routing engine</p>
                  </div>
                </div>
                {isHealthLoading ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-pulse"></span>
                ) : health?.dependencies.neo4j === 'up' ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-red-650 text-xs font-bold animate-pulse">
                    <XCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                )}
              </div>

              {/* Cache / PubSub */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200/40 dark:border-zinc-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-red-500/10 text-red-550 dark:text-red-400 rounded-md">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-slate-800 dark:text-zinc-200">Cache & Broker</h3>
                    <p className="text-[9px] text-slate-400 dark:text-zinc-500">Redis PubSub queue</p>
                  </div>
                </div>
                {isHealthLoading ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-pulse"></span>
                ) : health?.dependencies.redis === 'up' ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-red-650 text-xs font-bold animate-pulse">
                    <XCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-900/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-550 font-medium">
            <span>Automatic refresh active</span>
            <span>Health status checks: 10s intervals</span>
          </div>
        </div>
      </div>
    </div>
  );
}
