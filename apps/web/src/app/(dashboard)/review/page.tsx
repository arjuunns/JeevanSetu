'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Megaphone, Activity, Clipboard, Download, FileJson, CheckCircle2, AlertCircle, X, RefreshCw, CornerDownRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

import { SeverityBadge } from '@/components/SeverityBadge';
import { useTranslation } from '@/context/LanguageContext';
import { api, ApiClientError } from '@/lib/api';
import type { ReviewQueueItem } from '@/lib/types';

/**
 * Phase 8 — Doctor Review Dashboard. Shows the queue of AI assessments awaiting
 * sign-off (critical first), the AI severity, confidence, reasoning, citations,
 * and risk factors, with the four human-in-the-loop actions.
 */
export default function ReviewPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingSeverityFilter, setPendingSeverityFilter] = useState('');
  const [pendingSafetyFilter, setPendingSafetyFilter] = useState('');

  useEffect(() => {
    const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const socket = io(apiHost, {
      path: '/realtime',
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      socket.emit('subscribe', 'triage');
    });

    socket.on('triage', (data: any) => {
      void qc.invalidateQueries({ queryKey: ['review-queue'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [qc]);

  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ['review-queue'],
    queryFn: () => api.get<ReviewQueueItem[]>('/reviews/queue'),
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['review-history'],
    queryFn: () => api.get<ReviewQueueItem[]>('/reviews/history'),
    enabled: activeTab === 'HISTORY',
  });

  const filteredHistory = historyData?.filter((item) => {
    const matchesName = item.visit.patient.name.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = !severityFilter || (item.finalSeverity ?? item.aiSeverity) === severityFilter;
    const matchesAction = !actionFilter || item.review?.action === actionFilter;
    return matchesName && matchesSeverity && matchesAction;
  });

  const filteredQueue = queueData?.filter((item) => {
    const matchesName = item.visit.patient.name.toLowerCase().includes(pendingSearch.toLowerCase());
    const matchesSeverity = !pendingSeverityFilter || (item.finalSeverity ?? item.aiSeverity) === pendingSeverityFilter;
    const matchesSafety = !pendingSafetyFilter || 
      (pendingSafetyFilter === 'CRITICAL' && item.safetyIsCritical) ||
      (pendingSafetyFilter === 'NORMAL' && !item.safetyIsCritical);
    return matchesName && matchesSeverity && matchesSafety;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('queueTitle')}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{t('queueSubtitle')}</p>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl max-w-sm mt-6 mb-6 border dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all duration-200 ${
            activeTab === 'PENDING'
              ? 'bg-white text-slate-900 dark:bg-zinc-800 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50'
          }`}
        >
          {t('queueTitle')} ({queueData?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all duration-200 ${
            activeTab === 'HISTORY'
              ? 'bg-white text-slate-900 dark:bg-zinc-800 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50'
          }`}
        >
          Review History ({historyData?.length ?? 0})
        </button>
      </div>

      {activeTab === 'PENDING' ? (
        <div>
          {/* Pending Filters */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-wrap gap-4 items-center mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="label">Search Pending Patients</label>
              <input
                type="text"
                className="input"
                placeholder="Search by name..."
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Severity</label>
              <select className="input" value={pendingSeverityFilter} onChange={(e) => setPendingSeverityFilter(e.target.value)}>
                <option value="">All Severities</option>
                {['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Safety Status</label>
              <select className="input" value={pendingSafetyFilter} onChange={(e) => setPendingSafetyFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="CRITICAL">Safety Critical Only</option>
                <option value="NORMAL">Normal Safety</option>
              </select>
            </div>
          </div>

          {queueLoading ? (
            <p className="text-sm text-slate-500 dark:text-zinc-400">{t('loadingQueue')}</p>
          ) : !filteredQueue || filteredQueue.length === 0 ? (
            <p className="rounded-lg bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 text-sm text-slate-500 dark:text-zinc-400">No pending assessments match the filters.</p>
          ) : (
            <div className="space-y-4">
              {filteredQueue.map((item) => (
                <ReviewCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* History Filters */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-wrap gap-4 items-center mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="label">Search Patient</label>
              <input
                type="text"
                className="input"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Severity</label>
              <select className="input" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                <option value="">All Severities</option>
                {['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Action Taken</label>
              <select className="input" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                <option value="">All Actions</option>
                {['APPROVE', 'MODIFY', 'OVERRIDE', 'REJECT'].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {historyLoading ? (
            <p className="text-sm text-slate-500 dark:text-zinc-400">Loading history queue...</p>
          ) : !filteredHistory || filteredHistory.length === 0 ? (
            <p className="rounded-lg bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 text-sm text-slate-500 dark:text-zinc-450">No processed assessments match the filters.</p>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <HistoryCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IntakeInfoHoverTooltip({ visitId }: { visitId: string }) {
  const { data: visit, isLoading } = useQuery<any>({
    queryKey: ['visit-details', visitId],
    queryFn: () => api.get<any>(`/patients/visits/${visitId}`),
  });

  if (isLoading) return <div className="text-[10px] text-slate-400 dark:text-zinc-500">Loading profile...</div>;
  if (!visit) return <div className="text-[10px] text-red-500">Error loading details</div>;

  const vitals = visit.vitals?.[0] || {};
  const symptoms = visit.symptoms || [];

  return (
    <div className="space-y-2">
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-1.5 mb-1.5 text-[9px] text-slate-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
        Clinical Intake Profile
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
        <div>
          <span className="text-slate-400 dark:text-zinc-500 block">Blood Group</span>
          <span className="font-semibold text-slate-800 dark:text-zinc-200">{visit.patient.bloodGroup || 'UNKNOWN'}</span>
        </div>
        <div>
          <span className="text-slate-400 dark:text-zinc-500 block">Phone</span>
          <span className="font-semibold text-slate-800 dark:text-zinc-200">{visit.patient.phone || 'N/A'}</span>
        </div>
      </div>
      
      {/* Vitals summary */}
      <div className="border-t border-slate-100 dark:border-zinc-800 pt-1.5 mt-1.5 text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Vitals</div>
      <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-700 dark:text-zinc-300">
        <div>
          <span className="text-slate-400 dark:text-zinc-500 block font-normal text-[9px]">Temp</span>
          <span className="font-bold">{vitals.temperatureC != null ? `${vitals.temperatureC}°C` : '—'}</span>
        </div>
        <div>
          <span className="text-slate-400 dark:text-zinc-500 block font-normal text-[9px]">SpO2</span>
          <span className={`font-bold ${vitals.oxygenSaturation < 92 ? 'text-red-500' : ''}`}>{vitals.oxygenSaturation != null ? `${vitals.oxygenSaturation}%` : '—'}</span>
        </div>
        <div>
          <span className="text-slate-400 dark:text-zinc-500 block font-normal text-[9px]">Heart Rate</span>
          <span className="font-bold">{vitals.heartRate != null ? `${vitals.heartRate} bpm` : '—'}</span>
        </div>
      </div>

      {/* Allergies / Meds */}
      <div className="border-t border-slate-100 dark:border-zinc-800 pt-1.5 mt-1.5 text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">History</div>
      <div className="text-[10px] space-y-1 leading-normal text-slate-750 dark:text-zinc-300">
        <p><span className="text-slate-400 dark:text-zinc-500 font-normal">Allergies:</span> {visit.patient.allergies?.length ? visit.patient.allergies.join(', ') : 'None'}</p>
        <p><span className="text-slate-400 dark:text-zinc-500 font-normal">Diseases:</span> {visit.patient.existingDiseases?.length ? visit.patient.existingDiseases.join(', ') : 'None'}</p>
        <p><span className="text-slate-400 dark:text-zinc-500 font-normal">Medications:</span> {visit.patient.medications?.length ? visit.patient.medications.join(', ') : 'None'}</p>
      </div>
    </div>
  );
}

function HistoryCard({ item }: { item: ReviewQueueItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const doctorName = [item.review?.doctor?.firstName, item.review?.doctor?.lastName].filter(Boolean).join(' ') || item.review?.doctor?.email || 'Attending Doctor';

  const ranked = item.visit.routing?.rankedCandidates as any[];
  const selectedCandidate = Array.isArray(ranked) ? ranked[0] : null;
  const routingReason = selectedCandidate?.reasoning;

  const { data: visit } = useQuery<any>({
    queryKey: ['visit-details', item.visitId],
    queryFn: () => api.get<any>(`/patients/visits/${item.visitId}`),
  });
  const vitals = visit?.vitals?.[0] || {};

  return (
    <div className="relative rounded-2xl bg-slate-55/10 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 p-0 shadow-sm hover:shadow-md transition">
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-850">
        
        {/* Left Demographics column */}
        <div className="p-5 space-y-4 bg-slate-100/30 dark:bg-zinc-950/20 rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.visit.patient.name}</h3>
              <span className="text-xs font-semibold text-slate-450 dark:text-zinc-500">({item.visit.patient.age}/{item.visit.patient.gender})</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
              Blood Group: <span className="font-semibold text-slate-700 dark:text-zinc-300">{visit?.patient?.bloodGroup || 'UNKNOWN'}</span>
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-1">
              Registered: {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              <span className="block text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase">SpO2 Status</span>
              {vitals.oxygenSaturation != null ? (
                <span className={`text-sm font-extrabold ${vitals.oxygenSaturation < 92 ? 'text-red-500 animate-pulse' : 'text-green-600 dark:text-green-400'}`}>
                  {vitals.oxygenSaturation}% {vitals.oxygenSaturation < 92 ? '(Hypoxic)' : '(Normal)'}
                </span>
              ) : (
                <span className="text-sm font-extrabold text-slate-400 dark:text-zinc-550">—</span>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              <span className="block text-[9px] font-bold text-slate-450 dark:text-zinc-550 uppercase">Heart Rate</span>
              {vitals.heartRate != null ? (
                <span className={`text-sm font-extrabold ${vitals.heartRate > 100 || vitals.heartRate < 60 ? 'text-amber-500' : 'text-slate-800 dark:text-zinc-200'}`}>
                  {vitals.heartRate} bpm
                </span>
              ) : (
                <span className="text-sm font-extrabold text-slate-400 dark:text-zinc-555">—</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge ${
              item.review?.action === 'APPROVE' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400' :
              item.review?.action === 'REJECT' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400' :
              'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
            } font-bold text-[10px] uppercase`}>
              {item.review?.action}
            </span>
            <SeverityBadge severity={item.finalSeverity ?? item.aiSeverity} />
          </div>

          {/* Intake Info Hover Tooltip */}
          <div className="relative group inline-block">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
            >
              <Clipboard className="h-3.5 w-3.5 text-brand-700 dark:text-brand-500" />
              <span>Intake Info</span>
            </button>
            <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-30 text-left">
              <IntakeInfoHoverTooltip visitId={item.visitId} />
              <div className="absolute top-full left-8 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white dark:border-t-zinc-950 z-30"></div>
              <div className="absolute top-full left-8 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-200 dark:border-t-zinc-800 z-20 mt-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="p-5 md:col-span-2 space-y-4 flex flex-col justify-between rounded-r-2xl">
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Routing Target with hover reason */}
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-zinc-555 uppercase tracking-wider">Destination</p>
                <div className="relative group inline-block mt-0.5">
                  <h4 className="text-xs font-extrabold text-brand-700 dark:text-brand-400 border-b border-dashed border-brand-500/50 cursor-help flex items-center gap-1.5">
                    <CornerDownRight className="h-4 w-4" />
                    <span>{item.visit.routing?.selectedHospital?.name || 'Network Hospital'} — {item.recommendedDepartment || 'Emergency'}</span>
                  </h4>
                  
                  {routingReason && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-30 text-left">
                      <p className="text-[10px] font-bold text-slate-455 dark:text-zinc-550 uppercase tracking-wider mb-1.5">Smart Hospital Routing Justification</p>
                      <p className="text-xs text-slate-700 dark:text-zinc-300 leading-normal font-medium">{routingReason}</p>
                      <div className="absolute top-full left-8 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white dark:border-t-zinc-950 z-30"></div>
                      <div className="absolute top-full left-8 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-200 dark:border-t-zinc-800 z-20 mt-[1px]"></div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-850 text-slate-700 dark:text-zinc-300 font-medium text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
              >
                <Activity className="h-3 w-3 text-brand-700 dark:text-brand-500 animate-pulse" />
                <span>Pipeline Steps</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-555 dark:text-zinc-450">
              Reviewed by: <span className="font-semibold text-slate-750 dark:text-zinc-300">{doctorName}</span>
            </p>
            {item.review?.justification && (
              <p className="bg-slate-50 dark:bg-zinc-950/60 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800 text-xs italic text-slate-705 dark:text-zinc-350">
                "{item.review.justification}"
              </p>
            )}

            {/* AI Clinical reasoning text */}
            {item.reasoning?.reasoningText ? (
              <div className="rounded-xl p-3.5 border bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 mt-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-brand-700 dark:text-brand-400">
                  <Activity className="h-3.5 w-3.5" />
                  <span>AI Clinical Reasoning</span>
                </p>
                <div className="text-xs text-slate-755 dark:text-zinc-300 whitespace-pre-wrap font-medium leading-relaxed">
                  {item.reasoning.reasoningText}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/85">
            {/* Citations evidence */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Evidence:</span>
              {item.citations.map((c) => (
                <div key={c.chunkId} className="relative group">
                  <span className={`cursor-help px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border transition-all ${
                    c.source === 'WHO' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-zinc-800' :
                    c.source === 'ICMR' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-zinc-800' :
                    c.source === 'ESI' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-zinc-800' :
                    c.source === 'MTS' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-zinc-800' :
                    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800/40 dark:text-zinc-300 dark:border-zinc-800'
                  }`}>
                    {c.source} ({Math.round(c.score * 100)}%)
                  </span>
                  
                  {/* Tooltip Popup on Hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-30">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/85 pb-1 mb-1.5 text-[9px] text-slate-400 dark:text-zinc-550 font-bold uppercase">
                      <span>Source: {c.source}</span>
                      <span>Match: {Math.round(c.score * 100)}%</span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-[11px] mb-1">{c.title}</h4>
                    <p className="text-slate-655 dark:text-zinc-300 text-[10px] leading-relaxed max-h-36 overflow-y-auto select-text bg-slate-50 dark:bg-zinc-900/60 p-2 rounded border border-slate-100 dark:border-zinc-800">
                      {c.snippet}
                    </p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white dark:border-t-zinc-950 z-30"></div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-200 dark:border-t-slate-800 z-20 mt-[1px]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <PipelineAndReferralModal visitId={item.visitId} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}

function ReviewCard({ item }: { item: ReviewQueueItem }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [action, setAction] = useState<'APPROVE' | 'MODIFY' | 'OVERRIDE' | 'REJECT'>('APPROVE');
  const [justification, setJustification] = useState('');
  const [overrideSeverity, setOverrideSeverity] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [broadcasted, setBroadcasted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [rerunMsg, setRerunMsg] = useState<string | null>(null);

  const rerunMutation = useMutation({
    mutationFn: () => api.post(`/triage/visits/${item.visitId}/triage`, {}),
    onSuccess: () => {
      setRerunMsg('AI triage refreshed!');
      void qc.invalidateQueries({ queryKey: ['review-queue'] });
      setTimeout(() => setRerunMsg(null), 3000);
    },
    onError: (err) => {
      setRerunMsg(err instanceof ApiClientError ? err.message : 'Re-run failed');
    },
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.post(`/reviews/visits/${item.visitId}/review`, {
        action,
        justification: justification || undefined,
        overrideSeverity: overrideSeverity || undefined,
      }),
    onSuccess: () => {
      setMsg(null);
      setIsDismissing(true);
      setTimeout(() => {
        void qc.invalidateQueries({ queryKey: ['review-queue'] });
      }, 300);
    },
    onError: (err) => setMsg(err instanceof ApiClientError ? err.message : 'Failed'),
  });

  const broadcastMutation = useMutation({
    mutationFn: () =>
      api.post('/notifications/broadcast', {
        department: item.recommendedDepartment || 'Emergency',
        title: `EMERGENCY BROADCAST: Doctor Flagged Case`,
        body: `Specialist review requested by attending doctor for Patient ${item.visit.patient.name} in ${item.recommendedDepartment || 'Emergency'} department at ${item.visit.routing?.selectedHospital?.name || 'Network Hospital'}.`,
        payload: { visitId: item.visitId },
      }),
    onSuccess: () => {
      setBroadcasted(true);
    },
    onError: (err) => {
      setMsg(err instanceof ApiClientError ? err.message : 'Broadcast failed');
    },
  });

  const { data: visit } = useQuery<any>({
    queryKey: ['visit-details', item.visitId],
    queryFn: () => api.get<any>(`/patients/visits/${item.visitId}`),
  });
  const vitals = visit?.vitals?.[0] || {};

  const needsJustification = action === 'OVERRIDE' || action === 'MODIFY';

  const ranked = item.visit.routing?.rankedCandidates as any[];
  const selectedCandidate = Array.isArray(ranked) ? ranked[0] : null;
  const routingReason = selectedCandidate?.reasoning;

  return (
    <div className={`transition-all duration-300 ${isDismissing ? 'opacity-0 max-h-0 py-0 overflow-hidden mb-0 border-0 shadow-none' : 'relative mb-4 opacity-100 max-h-[1000px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-0 rounded-2xl shadow-sm hover:shadow-md'}`}>
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-850">
        
        {/* Left Demographics Panel */}
        <div className="p-5 space-y-4 bg-slate-55/30 dark:bg-zinc-950/20 rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{item.visit.patient.name}</h3>
              <span className="text-xs font-semibold text-slate-450 dark:text-zinc-500">({item.visit.patient.age}/{item.visit.patient.gender})</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-550 mt-0.5">
              Blood Group: <span className="font-semibold text-slate-700 dark:text-zinc-300">{visit?.patient?.bloodGroup || 'UNKNOWN'}</span>
            </p>
            <p className="text-[10px] text-slate-450 dark:text-zinc-500 mt-0.5">
              Registered: {new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              <span className="block text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase">SpO2 Status</span>
              {vitals.oxygenSaturation != null ? (
                <span className={`text-sm font-extrabold ${vitals.oxygenSaturation < 92 ? 'text-red-500 animate-pulse' : 'text-green-600 dark:text-green-400'}`}>
                  {vitals.oxygenSaturation}% {vitals.oxygenSaturation < 92 ? '(Hypoxic)' : '(Normal)'}
                </span>
              ) : (
                <span className="text-sm font-extrabold text-slate-400 dark:text-zinc-500">—</span>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              <span className="block text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Heart Rate</span>
              {vitals.heartRate != null ? (
                <span className={`text-sm font-extrabold ${vitals.heartRate > 100 || vitals.heartRate < 60 ? 'text-amber-500' : 'text-slate-800 dark:text-zinc-200'}`}>
                  {vitals.heartRate} bpm
                </span>
              ) : (
                <span className="text-sm font-extrabold text-slate-400 dark:text-zinc-500">—</span>
              )}
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <span className="text-[10px] font-bold text-slate-455 dark:text-zinc-500 uppercase tracking-wider block">Intake Safety Flags</span>
            <div className="flex flex-wrap gap-1.5">
              {item.redFlags && item.redFlags.length > 0 ? (
                item.redFlags.map((flag: string) => (
                  <span key={flag} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-critical dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-zinc-800">
                    {flag}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 italic">No flags triggered</span>
              )}
            </div>
          </div>

          {/* Intake Info Hover Tooltip */}
          <div className="relative group inline-block">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
            >
              <Clipboard className="h-3.5 w-3.5 text-brand-700 dark:text-brand-500" />
              <span>Intake Info</span>
            </button>
            <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-30 text-left">
              <IntakeInfoHoverTooltip visitId={item.visitId} />
              <div className="absolute top-full left-8 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white dark:border-t-zinc-950 z-30"></div>
              <div className="absolute top-full left-8 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-200 dark:border-t-zinc-800 z-20 mt-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="p-5 md:col-span-2 space-y-4 flex flex-col justify-between rounded-r-2xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">AI Recommended Route</p>
                <div className="relative group inline-block mt-0.5">
                  <h4 className="text-sm font-extrabold text-brand-700 dark:text-brand-400 flex items-center gap-1.5 cursor-help border-b border-dashed border-brand-500/50">
                    <CornerDownRight className="h-4 w-4" />
                    <span>{item.visit.routing?.selectedHospital?.name ?? '— (No routing run)'} — {item.recommendedDepartment ?? '—'}</span>
                  </h4>
                  {routingReason && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-30 text-left">
                      <p className="text-[10px] font-bold text-slate-455 dark:text-zinc-550 uppercase tracking-wider mb-1.5">Smart Hospital Routing Justification</p>
                      <p className="text-xs text-slate-700 dark:text-zinc-300 leading-normal font-medium">{routingReason}</p>
                      <div className="absolute top-full left-8 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white dark:border-t-zinc-950 z-30"></div>
                      <div className="absolute top-full left-8 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-200 dark:border-t-slate-800 z-20 mt-[1px]"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons (Rerun, Broadcast, steps) */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => rerunMutation.mutate()}
                  disabled={rerunMutation.isPending}
                  title="Re-run AI triage to get fresh reasoning"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-indigo-200 dark:border-indigo-850/60 text-indigo-700 dark:text-indigo-400 font-medium text-[10px] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:opacity-50 transition"
                >
                  {rerunMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  <span>Re-run</span>
                </button>
                <button
                  type="button"
                  onClick={() => broadcastMutation.mutate()}
                  disabled={broadcastMutation.isPending || broadcasted}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-red-200 dark:border-red-900/60 text-critical dark:text-red-400 font-medium text-[10px] hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50 transition"
                >
                  <Megaphone className="h-3 w-3" />
                  <span>{broadcasted ? 'Broadcasted' : 'Broadcast'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-850 text-slate-700 dark:text-zinc-350 font-medium text-[10px] hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                >
                  <Activity className="h-3 w-3 text-brand-700 dark:text-brand-500 animate-pulse" />
                  <span>Steps</span>
                </button>
              </div>
            </div>

            {rerunMsg && (
              <p className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                rerunMsg.includes('refreshed') ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
              }`}>
                {rerunMsg}
              </p>
            )}

            {/* AI Clinical reasoning text */}
            {item.reasoning?.reasoningText ? (
              <div className={`rounded-xl p-3.5 border ${
                item.reasoning.reasoningText.includes('[HEURISTIC FALLBACK]')
                  ? 'bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/60'
                  : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800'
              }`}>
                <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${
                  item.reasoning.reasoningText.includes('[HEURISTIC FALLBACK]')
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-brand-700 dark:text-brand-400'
                }`}>
                  <Activity className="h-3.5 w-3.5" />
                  {item.reasoning.reasoningText.includes('[HEURISTIC FALLBACK]')
                    ? '⚠ Heuristic Fallback — Click "Re-run AI" to get real AI reasoning'
                    : 'AI Clinical Reasoning'}
                </p>
                <div className="text-xs text-slate-755 dark:text-zinc-300 whitespace-pre-wrap font-medium leading-relaxed">
                  {item.reasoning.reasoningText}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
            {/* Citations evidence */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mr-1">{t('guidelineEvidence')}:</span>
              {item.citations.map((c) => (
                <div key={c.chunkId} className="relative group">
                  <span className={`cursor-help px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider border transition-all ${
                    c.source === 'WHO' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' :
                    c.source === 'ICMR' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' :
                    c.source === 'ESI' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' :
                    c.source === 'MTS' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' :
                    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800/40 dark:text-zinc-300 dark:border-zinc-800'
                  }`}>
                    {c.source} ({Math.round(c.score * 100)}%)
                  </span>
                  
                  {/* Tooltip Popup on Hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-30">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-1 mb-1.5 text-[9px] text-slate-400 dark:text-zinc-555 font-bold uppercase">
                      <span>Source: {c.source}</span>
                      <span>Match: {Math.round(c.score * 100)}%</span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-[11px] mb-1">{c.title}</h4>
                    <p className="text-slate-655 dark:text-zinc-300 text-[10px] leading-relaxed max-h-36 overflow-y-auto select-text bg-slate-50 dark:bg-zinc-900/60 p-2 rounded border border-slate-100 dark:border-zinc-800">
                      {c.snippet}
                    </p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white dark:border-t-zinc-950 z-30"></div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-200 dark:border-t-slate-800 z-20 mt-[1px]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Button Action Bar at card footer */}
      <div className="px-5 py-3.5 bg-slate-50 dark:bg-zinc-950/60 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-4 rounded-b-2xl">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'APPROVE', label: t('approve'), color: 'hover:bg-green-500 hover:text-white dark:hover:bg-green-600' },
              { id: 'MODIFY', label: t('modify'), color: 'hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600' },
              { id: 'OVERRIDE', label: t('override'), color: 'hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600' },
              { id: 'REJECT', label: t('reject'), color: 'hover:bg-red-500 hover:text-white dark:hover:bg-red-600' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAction(opt.id as any)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-150 ${
                  action === opt.id
                    ? 'bg-brand-700 text-white border-brand-700 dark:bg-brand-600 dark:border-brand-600 shadow-sm'
                    : `border-slate-200 bg-white text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 ${opt.color}`
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {action === 'OVERRIDE' ? (
            <div className="animate-scale-in">
              <select className="input h-9 text-xs font-semibold dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" value={overrideSeverity} onChange={(e) => setOverrideSeverity(e.target.value)}>
                <option value="">— Severity Override —</option>
                {['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {needsJustification ? (
            <div className="flex-1 min-w-[200px] animate-scale-in">
              <input className="input h-9 text-xs dark:bg-zinc-900 border-slate-200 dark:border-zinc-800" value={justification} onChange={(e) => setJustification(e.target.value)} placeholder={t('justificationPlaceholder')} />
            </div>
          ) : null}
        </div>
        
        <button className="btn-primary px-4 py-2 text-xs font-bold shadow-md shadow-brand-500/10" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
          {t('submitReview')}
        </button>
      </div>

      {msg ? <p className="px-5 pb-3 text-xs text-critical font-medium">{msg}</p> : null}
      {isOpen && (
        <PipelineAndReferralModal visitId={item.visitId} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}

interface DetailedVisit {
  id: string;
  status: string;
  chiefComplaint?: string | null;
  patient: { name: string; age: number; gender: string; bloodGroup: string; phone?: string };
  routing?: {
    selectedHospital?: { name: string; address: string } | null;
  } | null;
  referral?: {
    id: string;
    referralCode: string;
    status: string;
    documents: { id: string; format: 'PDF' | 'FHIR_JSON' | 'QR_CODE'; url: string }[];
  } | null;
  agentRuns: {
    id: string;
    agentType: string;
    status: string;
    supervisorVerdict?: { approved: boolean; issues: string[]; notes: string } | null;
    createdAt: string;
  }[];
}

function PipelineAndReferralModal({ visitId, onClose }: { visitId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: visit, isLoading, error } = useQuery<DetailedVisit>({
    queryKey: ['visit-details', visitId],
    queryFn: () => api.get<DetailedVisit>(`/patients/visits/${visitId}`),
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post<{ referralId: string }>(`/referrals/visits/${visitId}/generate`, {}),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['visit-details', visitId] });
      void qc.invalidateQueries({ queryKey: ['review-queue'] });
    },
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
        <div className="relative bg-slate-50 dark:bg-zinc-900 h-full w-full max-w-lg shadow-2xl border-l border-slate-200 dark:border-zinc-800 flex flex-col justify-center items-center p-6 animate-slide-left" onClick={(e) => e.stopPropagation()}>
          <Loader2 className="h-8 w-8 animate-spin text-brand-700 dark:text-brand-500 mb-2" />
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Loading details...</span>
        </div>
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
        <div className="relative bg-slate-50 dark:bg-zinc-900 h-full w-full max-w-lg shadow-2xl border-l border-slate-200 dark:border-zinc-800 flex flex-col p-6 animate-slide-left" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-red-600">Error Loading Details</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-zinc-500">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-zinc-400">Could not fetch pipeline or referral info.</p>
        </div>
      </div>
    );
  }

  const pdfDoc = visit.referral?.documents.find((d) => d.format === 'PDF');
  const fhirDoc = visit.referral?.documents.find((d) => d.format === 'FHIR_JSON');
  const qrDoc = visit.referral?.documents.find((d) => d.format === 'QR_CODE');

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
      <div
        className="relative bg-slate-50 dark:bg-zinc-900 h-full w-full max-w-lg shadow-2xl border-l border-slate-200 dark:border-zinc-800 flex flex-col animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pipeline & Referral Details</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Patient: <span className="font-semibold">{visit.patient.name}</span> | Visit ID: {visit.id}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Multi-Agent Orchestrator Pipeline */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-5 border border-slate-100 dark:border-zinc-800/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-brand-700 dark:text-brand-500 animate-pulse" />
              <span>Multi-Agent Pipeline Steps</span>
            </h3>

            {visit.agentRuns.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 italic">No agent execution history recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {visit.agentRuns.map((run, idx) => {
                  const hasVerdict = !!run.supervisorVerdict;
                  const supervisorVerdictObj = run.supervisorVerdict as { approved: boolean; issues?: string[]; notes?: string } | null;
                  const isApproved = supervisorVerdictObj?.approved;
                  return (
                     <div key={run.id} className="relative pl-8 border-l-2 border-slate-200 dark:border-zinc-800 last:border-0 pb-6">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[10px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-zinc-950">
                        {run.status === 'SUCCEEDED' ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-green-600 bg-white dark:bg-zinc-950 rounded-full animate-scale-in" />
                        ) : run.status === 'REJECTED_BY_SUPERVISOR' || run.status === 'FAILED' ? (
                          <AlertCircle className="h-4.5 w-4.5 text-red-600 bg-white dark:bg-zinc-950 rounded-full animate-scale-in" />
                        ) : (
                          <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-300 tracking-wide uppercase">
                          {idx + 1}. {run.agentType.replace('_', ' ')}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            run.status === 'SUCCEEDED'
                              ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                              : run.status === 'REJECTED_BY_SUPERVISOR'
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400'
                          }`}
                        >
                          {run.status}
                        </span>
                      </div>

                      {hasVerdict && (
                        <div className="mt-1.5 bg-slate-50 dark:bg-zinc-900 rounded-lg p-2.5 border border-slate-100 dark:border-zinc-800/60 text-xs animate-scale-in">
                          <p className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                            {isApproved ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                            )}
                            <span>Supervisor Verdict: {isApproved ? 'Approved' : 'Rejected'}</span>
                          </p>
                          {supervisorVerdictObj?.notes && (
                            <p className="text-slate-650 dark:text-zinc-400 mt-1 italic">"{supervisorVerdictObj.notes}"</p>
                          )}
                          {supervisorVerdictObj?.issues && supervisorVerdictObj.issues.length > 0 && (
                            <ul className="list-disc list-inside mt-1 text-red-600 font-medium">
                              {supervisorVerdictObj.issues.map((issue: string, i: number) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: HL7 FHIR & PDF Referral Generation */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-5 border border-slate-100 dark:border-zinc-800/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Clipboard className="h-4 w-4 text-brand-700 dark:text-brand-500" />
              <span>FHIR & PDF Referrals</span>
            </h3>

            {visit.referral ? (
              <div className="space-y-4">
                <div className="bg-green-50/50 border border-green-100 dark:bg-green-950/20 dark:border-zinc-850 rounded-lg p-3 text-xs text-green-800 dark:text-green-400">
                  <p className="font-bold">Referral Active</p>
                  <p className="mt-0.5">
                    Code: <span className="font-mono font-semibold">{visit.referral.referralCode}</span>
                  </p>
                  <p className="mt-0.5">
                    Routed to:{' '}
                    <span className="font-semibold">
                      {visit.routing?.selectedHospital?.name || 'Network Hospital'}
                    </span>
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {/* PDF doc */}
                  {pdfDoc && (
                    <a
                      href={pdfDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-zinc-800 hover:border-brand-500 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 transition text-center"
                    >
                      <Download className="h-6 w-6 text-red-600 mb-2" />
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Printable PDF</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1">Download Referral</span>
                    </a>
                  )}

                  {/* FHIR doc */}
                  {fhirDoc && (
                    <a
                      href={fhirDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-zinc-800 hover:border-brand-500 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 transition text-center"
                    >
                      <FileJson className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">HL7 FHIR JSON</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1">Download Interoperable Bundle</span>
                    </a>
                  )}

                  {/* QR code doc */}
                  {qrDoc && (
                    <div className="flex flex-col items-center justify-center p-3 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900">
                      <img src={qrDoc.url} alt="Referral QR Code" className="h-16 w-16 mb-2 border rounded bg-white p-1" />
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">QR Code</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-500 mt-0.5">Verification Scan</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">No referral generated yet. Referral documents require doctor approval first.</p>
                {visit.status === 'APPROVED' ? (
                  <button
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    className="btn-primary inline-flex items-center gap-1.5 px-4 py-2"
                  >
                    {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clipboard className="h-4 w-4" />}
                    <span>Generate Referral Documents</span>
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded bg-slate-100 dark:bg-zinc-900 text-slate-650 dark:text-zinc-400 text-xs font-semibold">
                    Awaiting Doctor Review Approval
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientIntakeModal({ visitId, onClose }: { visitId: string; onClose: () => void }) {
  const { data: visit, isLoading } = useQuery<DetailedVisit & { vitals?: any[]; symptoms?: any[]; createdAt?: string }>({
    queryKey: ['visit-details', visitId],
    queryFn: () => api.get<DetailedVisit & { vitals?: any[]; symptoms?: any[]; createdAt?: string }>(`/patients/visits/${visitId}`),
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in" onClick={onClose}>
        <div className="relative bg-slate-50 dark:bg-zinc-900 h-full w-full max-w-lg shadow-2xl border-l border-slate-200 dark:border-zinc-800 flex flex-col justify-center items-center p-6" onClick={(e) => e.stopPropagation()}>
          <Loader2 className="h-8 w-8 animate-spin text-brand-700 dark:text-brand-500 mb-2" />
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Loading intake record...</span>
        </div>
      </div>
    );
  }

  if (!visit) return null;

  const vitals = visit.vitals?.[0] || {};
  const symptoms = visit.symptoms || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in" onClick={onClose}>
      <div
        className="relative bg-slate-50 dark:bg-zinc-900 h-full w-full max-w-lg shadow-2xl border-l border-slate-200 dark:border-zinc-800 flex flex-col animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Patient Intake Details</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Registered on {new Date(visit.createdAt || Date.now()).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Demographics */}
          <div className="card">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Demographics</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Full Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{visit.patient.name}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Age / Gender</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{visit.patient.age} / {visit.patient.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Blood Group</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{visit.patient.bloodGroup || 'UNKNOWN'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Phone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{visit.patient.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="card">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Vital Signs</h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className={(vitals.temperatureC > 38.5 || vitals.temperatureC < 35) ? "text-amber-600 font-bold" : "text-slate-700 dark:text-slate-300"}>
                <span className="text-slate-400 dark:text-slate-500 block font-normal">Temp (°C)</span>
                <span>{vitals.temperatureC != null ? `${vitals.temperatureC}°C` : '—'}</span>
              </div>
              <div className={vitals.oxygenSaturation < 92 ? "text-red-605 font-bold animate-pulse" : "text-slate-700 dark:text-slate-300"}>
                <span className="text-slate-400 dark:text-slate-500 block font-normal">SpO2</span>
                <span>{vitals.oxygenSaturation != null ? `${vitals.oxygenSaturation}%` : '—'}</span>
              </div>
              <div className={(vitals.heartRate > 120 || vitals.heartRate < 50) ? "text-amber-600 font-bold" : "text-slate-700 dark:text-slate-300"}>
                <span className="text-slate-400 dark:text-slate-500 block font-normal">Heart Rate</span>
                <span>{vitals.heartRate != null ? `${vitals.heartRate} bpm` : '—'}</span>
              </div>
              <div className={(vitals.respiratoryRate > 24 || vitals.respiratoryRate < 10) ? "text-amber-600 font-bold" : "text-slate-700 dark:text-slate-300"}>
                <span className="text-slate-400 dark:text-slate-500 block font-normal">Resp. Rate</span>
                <span>{vitals.respiratoryRate != null ? `${vitals.respiratoryRate} /min` : '—'}</span>
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 block font-normal">BP</span>
                <span>{vitals.systolicBp != null && vitals.diastolicBp != null ? `${vitals.systolicBp}/${vitals.diastolicBp}` : '—'}</span>
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 block font-normal">Consciousness</span>
                <span>{vitals.isUnconscious ? 'Unconscious 🔴' : 'Conscious 🟢'}</span>
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="card">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Symptoms & Complaint</h3>
            {visit.chiefComplaint && (
              <div className="mb-3">
                <span className="text-slate-400 dark:text-slate-500 block text-xs">Chief Complaint</span>
                <p className="text-xs text-slate-750 dark:text-slate-350 italic">"{visit.chiefComplaint}"</p>
              </div>
            )}
            <div className="space-y-2">
              <span className="text-slate-400 dark:text-slate-500 block text-xs">Symptoms Listed</span>
              <div className="flex flex-wrap gap-1.5">
                {symptoms.map((s: any) => (
                  <span key={s.id} className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.isPrimary ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-350 border border-brand-200 dark:border-brand-900' : 'bg-slate-105 text-slate-705 dark:bg-slate-805 dark:text-slate-305'}`}>
                    {s.name} ({s.severity}) {s.isPrimary ? '[Primary]' : ''}
                  </span>
                ))}
                {symptoms.length === 0 && <span className="text-xs text-slate-400 dark:text-slate-500 italic">No symptoms recorded.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
