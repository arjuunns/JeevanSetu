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
import { 
  Users, 
  AlertTriangle, 
  GitPullRequest, 
  Megaphone, 
  Activity, 
  PieChartIcon, 
  BarChart3, 
  TrendingUp, 
  ShieldAlert,
  Clock,
  ThumbsUp
} from 'lucide-react';

import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/Skeleton';
import { api } from '@/lib/api';
import type { DashboardMetricsView } from '@/lib/types';
import { useTranslation } from '@/context/LanguageContext';

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MODERATE: '#eab308',
  LOW: '#22c55e',
};

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CLINICAL' | 'OPERATIONS'>('OVERVIEW');
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.get<DashboardMetricsView>('/dashboard/metrics'),
  });

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('cmoDashboard')}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('cmoSubtitle')}</p>

      {/* Premium Tab Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mt-6 mb-6 gap-6">
        {[
          { id: 'OVERVIEW', label: 'Overview Metrics', icon: Activity },
          { id: 'CLINICAL', label: 'Clinical Severity', icon: PieChartIcon },
          { id: 'OPERATIONS', label: 'Operational Load', icon: BarChart3 }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-2.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-brand-700 text-brand-700 dark:border-brand-500 dark:text-brand-500'
                : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-scale-in">
          {/* Glassmorphic Metrics Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Patients */}
            <div className="relative group overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-205 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200 h-40 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total Patients</span>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl text-brand-700 dark:text-brand-400">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-auto">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : data?.totals.patients ?? 0}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">All patient intake admissions</p>
              </div>
            </div>

            {/* Critical Cases */}
            <div className="relative group overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-205 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200 h-40 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Critical Cases</span>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl text-red-655 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-auto">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : data?.totals.criticalPatients ?? 0}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">Requires immediate attending review</p>
              </div>
            </div>

            {/* Referrals Routed */}
            <div className="relative group overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-205 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200 h-40 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Referrals Routed</span>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl text-emerald-700 dark:text-emerald-400">
                  <GitPullRequest className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-auto">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : data?.totals.referrals ?? 0}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">Active clinical referral records</p>
              </div>
            </div>

            {/* Active Broadcasts */}
            <div className="relative group overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-205 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200 h-40 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Active Broadcasts</span>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl text-amber-700 dark:text-amber-400">
                  <Megaphone className="h-5 w-5 animate-pulse" />
                </div>
              </div>
              <div className="mt-auto">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : data?.totals.activeAlerts ?? 0}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">System alerts flagged</p>
              </div>
            </div>
          </div>

          {/* Performance rates details */}
          <div className="card">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Core Operational Rates</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Average Triage Time */}
              <div className="relative group overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-205 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200 h-40 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('averageTriageTime')}</span>
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl text-brand-700 dark:text-brand-400">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-auto">
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {isLoading ? '—' : data?.rates.avgTriageSeconds != null ? `${data.rates.avgTriageSeconds}s` : '—'}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">Total API Roundtrip latency</p>
                </div>
              </div>

              {/* Override Rate */}
              <div className="relative group overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-205 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200 h-40 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('overrideRate')}</span>
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl text-red-655 dark:text-red-400">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-auto">
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {isLoading ? '—' : `${Math.round((data?.rates.overrideRate ?? 0) * 100)}%`}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">Human modifications to AI severity</p>
                </div>
              </div>

              {/* Avg AI Confidence */}
              <div className="relative group overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-205 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200 h-40 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Avg AI Confidence</span>
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <ThumbsUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-auto">
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {isLoading ? '—' : `${Math.round((data?.rates.avgAiConfidence ?? 0) * 100)}%`}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">Average model confidence score</p>
                </div>
              </div>

              {/* Routing Success */}
              <div className="relative group overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-205 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-200 h-40 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('routingSuccess')}</span>
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl text-brand-700 dark:text-brand-500">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-auto">
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {isLoading ? '—' : `${Math.round((data?.rates.routingSuccessRate ?? 0) * 100)}%`}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">Successful smart hospital routes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLINICAL SEVERITY */}
      {activeTab === 'CLINICAL' && (
        <div className="grid gap-6 lg:grid-cols-3 animate-scale-in">
          <div className="card lg:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">{t('severityDistribution')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Percentage breakdown of triage severity categories across registered patients.</p>
            </div>
            <div className="h-[280px]">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
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
          </div>

          <div className="card flex flex-col">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Severity Details</h3>
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-32" />
              ) : (
                (data?.severityDistribution ?? []).map((item) => (
                  <div key={item.severity} className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[item.severity] }}></span>
                      <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">{item.severity}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.count} patients</span>
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
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card">
              <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">{t('referralTrends')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Total referrals executed daily over the past 14 days.</p>
              {isLoading ? (
                <Skeleton className="w-full h-[260px]" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data?.referralTrend ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card">
              <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">{t('hospitalLoad')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Network hospital occupancy loads in real-time.</p>
              {isLoading ? (
                <Skeleton className="w-full h-[260px]" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data?.hospitalOccupancy ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip />
                    <Bar dataKey="occupancyPct" fill="#0d9488" radius={[4, 4, 0, 0]}>
                      {(data?.hospitalOccupancy ?? []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.occupancyPct > 80 ? '#ef4444' : '#0d9488'} />
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
