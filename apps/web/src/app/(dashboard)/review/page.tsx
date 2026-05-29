'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Megaphone, Activity, Clipboard, Download, FileJson, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

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
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{t('queueTitle')}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('queueSubtitle')}</p>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl max-w-sm mt-6 mb-6">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all duration-200 ${
            activeTab === 'PENDING'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('queueTitle')} ({queueData?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all duration-200 ${
            activeTab === 'HISTORY'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Review History ({historyData?.length ?? 0})
        </button>
      </div>

      {activeTab === 'PENDING' ? (
        queueLoading ? (
          <p className="mt-6 text-sm text-slate-500">{t('loadingQueue')}</p>
        ) : !queueData || queueData.length === 0 ? (
          <p className="mt-6 rounded-lg bg-white p-6 text-sm text-slate-500">{t('noAssessments')}</p>
        ) : (
          <div className="mt-6 space-y-4">
            {queueData.map((item) => (
              <ReviewCard key={item.id} item={item} />
            ))}
          </div>
        )
      ) : (
        <div>
          {/* History Filters */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center mb-6">
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
            <p className="text-sm text-slate-500">Loading history queue...</p>
          ) : !filteredHistory || filteredHistory.length === 0 ? (
            <p className="rounded-lg bg-white p-6 text-sm text-slate-500">No processed assessments match the filters.</p>
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

function HistoryCard({ item }: { item: ReviewQueueItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const doctorName = [item.review?.doctor?.firstName, item.review?.doctor?.lastName].filter(Boolean).join(' ') || item.review?.doctor?.email || 'Attending Doctor';

  return (
    <div className="card bg-slate-50/50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            {item.visit.patient.name}{' '}
            <span className="text-sm font-normal text-slate-500">
              ({item.visit.patient.age}/{item.visit.patient.gender})
            </span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            {item.visit.routing?.selectedHospital?.name || 'Network Hospital'} — {item.recommendedDepartment || 'Emergency'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${
            item.review?.action === 'APPROVE' ? 'bg-green-100 text-green-800' :
            item.review?.action === 'REJECT' ? 'bg-red-100 text-red-800' :
            'bg-amber-100 text-amber-800'
          } font-bold text-xs uppercase`}>
            {item.review?.action}
          </span>
          <SeverityBadge severity={item.finalSeverity ?? item.aiSeverity} />
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition ml-2"
          >
            <Activity className="h-3 w-3 text-brand-700 animate-pulse" />
            <span>Pipeline & Referral</span>
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-600 space-y-1">
        <p>Reviewed by: <span className="font-semibold">{doctorName}</span> on {item.review?.reviewedAt ? new Date(item.review.reviewedAt).toLocaleDateString() : 'N/A'}</p>
        {item.review?.justification && (
          <p className="bg-white p-2 rounded-lg border border-slate-100 italic mt-1">
            "{item.review.justification}"
          </p>
        )}
        {item.reasoning?.reasoningText && (
          <div className="mt-2 bg-blue-50/50 border border-blue-100 rounded-lg p-3 shadow-inner">
            <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              AI Reasoning
            </p>
            <div className="text-xs text-slate-700 whitespace-pre-wrap font-medium leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
              {item.reasoning.reasoningText}
            </div>
          </div>
        )}
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

  const needsJustification = action === 'OVERRIDE' || action === 'MODIFY';

  return (
    <div className={`transition-all duration-300 ${isDismissing ? 'opacity-0 max-h-0 py-0 overflow-hidden mb-0 border-0 shadow-none' : 'card mb-4 opacity-100 max-h-[1000px]'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            {item.visit.patient.name}{' '}
            <span className="text-sm font-normal text-slate-500">
              ({item.visit.patient.age}/{item.visit.patient.gender})
            </span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            {item.visit.routing?.selectedHospital?.name || 'Network Hospital'} — {item.recommendedDepartment || 'Emergency'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {item.safetyIsCritical && (
            <span className="badge bg-red-100 text-critical">{t('safetyCriticalBadge')}</span>
          )}
          <SeverityBadge severity={item.finalSeverity ?? item.aiSeverity} />
          {item.aiConfidence !== null && (
            <span className="badge bg-slate-100 text-slate-600">conf {Math.round(item.aiConfidence * 100)}%</span>
          )}
          <button
            onClick={() => broadcastMutation.mutate()}
            disabled={broadcastMutation.isPending || broadcasted}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 text-critical font-medium text-xs hover:bg-red-50 disabled:opacity-50 transition ml-2"
          >
            <Megaphone className="h-3 w-3" />
            {broadcasted ? 'Broadcasted' : 'Broadcast'}
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition ml-2"
          >
            <Activity className="h-3 w-3 text-brand-700 animate-pulse" />
            <span>Pipeline & Referral</span>
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="font-medium text-slate-700">{t('recommendedDept')}</p>
          <p className="text-slate-600">{item.recommendedDepartment ?? '—'}</p>
        </div>
        <div>
          <p className="font-medium text-slate-700">{t('suggestedHospital')}</p>
          <p className="text-slate-600 font-medium text-brand-700">
            {item.visit.routing?.selectedHospital?.name ?? '— (No routing run)'}
          </p>
        </div>
        <div>
          <p className="font-medium text-slate-700">{t('redFlags')}</p>
          <p className="text-slate-600">{item.redFlags.length ? item.redFlags.join(', ') : 'None'}</p>
        </div>
      </div>

      {item.reasoning?.reasoningText ? (
        <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-lg p-4 shadow-inner">
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            AI Clinical Reasoning
          </p>
          <div className="text-sm text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">
            {item.reasoning.reasoningText}
          </div>
        </div>
      ) : null}

      {item.citations.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('guidelineEvidence')}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {item.citations.map((c) => (
              <div key={c.chunkId} className="flex flex-col rounded-lg border border-slate-100 bg-white p-3 shadow-sm hover:shadow transition duration-200">
                <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                    c.source === 'WHO' ? 'bg-blue-50 text-blue-700' :
                    c.source === 'ICMR' ? 'bg-emerald-50 text-emerald-700' :
                    c.source === 'ESI' ? 'bg-amber-50 text-amber-700' :
                    c.source === 'MTS' ? 'bg-purple-50 text-purple-700' :
                    'bg-slate-50 text-slate-700'
                  }`}>
                    {c.source}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    {t('matchScore')}: {Math.round(c.score * 100)}%
                  </span>
                </div>
                <h4 className="font-semibold text-slate-800 text-xs truncate mb-1" title={c.title}>
                  {c.title}
                </h4>
                <p className="text-slate-700 text-xs whitespace-pre-wrap leading-relaxed line-clamp-6 select-text bg-slate-50 p-2 rounded border border-slate-100">
                  {c.snippet}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
        <div>
          <label className="label">{t('actionLabel')}</label>
          <select className="input" value={action} onChange={(e) => setAction(e.target.value as typeof action)}>
            <option value="APPROVE">{t('approve')}</option>
            <option value="MODIFY">{t('modify')}</option>
            <option value="OVERRIDE">{t('override')}</option>
            <option value="REJECT">{t('reject')}</option>
          </select>
        </div>
        {action === 'OVERRIDE' ? (
          <div>
            <label className="label">{t('overrideSeverity')}</label>
            <select className="input" value={overrideSeverity} onChange={(e) => setOverrideSeverity(e.target.value)}>
              <option value="">—</option>
              {['CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {needsJustification ? (
          <div className="flex-1">
            <label className="label">{t('justification')}</label>
            <input className="input" value={justification} onChange={(e) => setJustification(e.target.value)} placeholder={t('justificationPlaceholder')} />
          </div>
        ) : null}
        <button className="btn-primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t('submitReview')}
        </button>
      </div>
      {msg ? <p className="mt-2 text-sm text-critical">{msg}</p> : null}

      {isOpen && (
        <PipelineAndReferralModal visitId={item.visitId} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}

interface DetailedVisit {
  id: string;
  status: string;
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
        <div className="relative bg-slate-50 h-full w-full max-w-lg shadow-2xl border-l border-slate-200 flex flex-col justify-center items-center p-6 animate-slide-left" onClick={(e) => e.stopPropagation()}>
          <Loader2 className="h-8 w-8 animate-spin text-brand-700 mb-2" />
          <span className="text-sm font-medium text-slate-700">Loading details...</span>
        </div>
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
        <div className="relative bg-slate-50 h-full w-full max-w-lg shadow-2xl border-l border-slate-200 flex flex-col p-6 animate-slide-left" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-red-600">Error Loading Details</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-slate-600">Could not fetch pipeline or referral info.</p>
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
        className="relative bg-slate-50 h-full w-full max-w-lg shadow-2xl border-l border-slate-200 flex flex-col animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pipeline & Referral Details</h2>
            <p className="text-xs text-slate-500">
              Patient: <span className="font-semibold">{visit.patient.name}</span> | Visit ID: {visit.id}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Multi-Agent Orchestrator Pipeline */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-brand-700 animate-pulse" />
              <span>Multi-Agent Pipeline Steps</span>
            </h3>

            {visit.agentRuns.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No agent execution history recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {visit.agentRuns.map((run, idx) => {
                  const hasVerdict = !!run.supervisorVerdict;
                  const supervisorVerdictObj = run.supervisorVerdict as { approved: boolean; issues?: string[]; notes?: string } | null;
                  const isApproved = supervisorVerdictObj?.approved;
                  return (
                    <div key={run.id} className="relative pl-8 border-l-2 border-slate-200 last:border-0 pb-6">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[10px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                        {run.status === 'SUCCEEDED' ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-green-600 bg-white rounded-full animate-scale-in" />
                        ) : run.status === 'REJECTED_BY_SUPERVISOR' || run.status === 'FAILED' ? (
                          <AlertCircle className="h-4.5 w-4.5 text-red-600 bg-white rounded-full animate-scale-in" />
                        ) : (
                          <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                          {idx + 1}. {run.agentType.replace('_', ' ')}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            run.status === 'SUCCEEDED'
                              ? 'bg-green-50 text-green-700'
                              : run.status === 'REJECTED_BY_SUPERVISOR'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {run.status}
                        </span>
                      </div>

                      {hasVerdict && (
                        <div className="mt-1.5 bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs animate-scale-in">
                          <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                            {isApproved ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                            )}
                            <span>Supervisor Verdict: {isApproved ? 'Approved' : 'Rejected'}</span>
                          </p>
                          {supervisorVerdictObj?.notes && (
                            <p className="text-slate-600 mt-1 italic">"{supervisorVerdictObj.notes}"</p>
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
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Clipboard className="h-4 w-4 text-brand-700" />
              <span>FHIR & PDF Referrals</span>
            </h3>

            {visit.referral ? (
              <div className="space-y-4">
                <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 text-xs text-green-800">
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
                      className="flex flex-col items-center justify-center p-4 border border-slate-200 hover:border-brand-500 rounded-xl hover:bg-slate-50 transition text-center"
                    >
                      <Download className="h-6 w-6 text-red-600 mb-2" />
                      <span className="text-xs font-bold text-slate-800">Printable PDF</span>
                      <span className="text-[10px] text-slate-500 mt-1">Download Referral</span>
                    </a>
                  )}

                  {/* FHIR doc */}
                  {fhirDoc && (
                    <a
                      href={fhirDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-4 border border-slate-200 hover:border-brand-500 rounded-xl hover:bg-slate-50 transition text-center"
                    >
                      <FileJson className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="text-xs font-bold text-slate-800">HL7 FHIR JSON</span>
                      <span className="text-[10px] text-slate-500 mt-1">Download Interoperable Bundle</span>
                    </a>
                  )}

                  {/* QR code doc */}
                  {qrDoc && (
                    <div className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-xl bg-slate-50">
                      <img src={qrDoc.url} alt="Referral QR Code" className="h-16 w-16 mb-2 border rounded bg-white p-1" />
                      <span className="text-xs font-bold text-slate-800">QR Code</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Verification Scan</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-4">No referral generated yet. Referral documents require doctor approval first.</p>
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
                  <span className="px-3 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
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
