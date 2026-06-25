'use client';

import { useState } from 'react';
import { 
  Users, Activity, AlertTriangle, CheckCircle2, 
  Clock, ShieldAlert, Heart, Clipboard, HelpCircle,
  FileText, Download, FileJson, ArrowRight, CornerDownRight,
  TrendingUp, Award, Layers, Sparkles, Hospital
} from 'lucide-react';
import { SeverityBadge } from '@/components/SeverityBadge';

// Mock Patient Data representing a critical case
const MOCK_PATIENT_ITEM = {
  id: 'mock-visit-101',
  visitId: 'mock-visit-101',
  createdAt: new Date().toISOString(),
  safetyIsCritical: true,
  aiSeverity: 'CRITICAL',
  finalSeverity: 'CRITICAL',
  aiConfidence: 0.94,
  recommendedDepartment: 'Cardiology / Emergency',
  redFlags: ['Substernal chest pain', 'Dyspnea', 'O2 Sat < 94%'],
  reasoning: {
    reasoningText: 'Patient presents with acute onset retrosternal crushing chest pain radiating to left arm. Vitals indicate tachycardia (112 bpm) and borderline hypoxia (93% SpO2 on room air). Deterministic safety filters triggered rules for high heart rate and respiratory distress warning. ECG recommended immediately to rule out acute coronary syndrome.'
  },
  citations: [
    {
      chunkId: 'who-acs-1',
      source: 'WHO',
      score: 0.95,
      title: 'Emergency Management of Acute Coronary Syndrome',
      snippet: 'Patients presenting with acute chest pain, dyspnea, or radiating pain should be assessed immediately for ECG changes. Oxygen supplementation is recommended if oxygen saturation drops below 94%.'
    },
    {
      chunkId: 'icmr-cv-2',
      source: 'ICMR',
      score: 0.88,
      title: 'Clinical Practice Guidelines for Ischemic Heart Disease',
      snippet: 'High-risk indicators include chest pain, tachycardia (>100 bpm), or secondary respiratory symptoms. Triage to emergency cardiac catheterization facility if ST-elevation is confirmed.'
    }
  ],
  visit: {
    patient: {
      name: 'Krit Mukul',
      age: 20,
      gender: 'MALE',
      bloodGroup: 'O_POSITIVE',
      phone: '+91 98765 43210'
    },
    routing: {
      selectedHospital: {
        name: 'PGIMER Chandigarh',
        address: 'Sector 12, Chandigarh'
      },
      rankedCandidates: [
        {
          hospital: 'PGIMER Chandigarh',
          reasoning: 'PGIMER Chandigarh is 0 km away (~4 min transport). It currently has 8 active ICU beds, a fully operational Cardiac Catheterization Lab, on-duty cardiologist specialists, and a Tier 4 emergency capability rating.'
        }
      ]
    }
  }
};

export default function ReviewDesignsPage() {
  const [activeView, setActiveView] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-brand-500 animate-pulse" />
            <span>Doctor Review Card Options</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Compare 3 alternative UI designs for the patient review card. Inspect color styling, layouts, and responsiveness.
          </p>
        </div>

        {/* Design Selector */}
        <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border dark:border-zinc-800">
          {[
            { id: 'ALL', label: 'View All' },
            { id: 'A', label: 'Design A: Command Card' },
            { id: 'B', label: 'Design B: Timeline story' },
            { id: 'C', label: 'Design C: Glassmorphic' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeView === tab.id
                  ? 'bg-white text-slate-900 dark:bg-zinc-850 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8">
        {/* DESIGN A: Clinical Command Card */}
        {(activeView === 'ALL' || activeView === 'A') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400">DESIGN A</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Structured Command Card (Data-Dense & Grid Focused)</h2>
            </div>
            <CommandReviewCard item={MOCK_PATIENT_ITEM} />
          </div>
        )}

        {/* DESIGN B: Narrative Timeline story */}
        {(activeView === 'ALL' || activeView === 'B') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">DESIGN B</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Clinical Timeline story Card (Journey & Flow Focused)</h2>
            </div>
            <TimelineReviewCard item={MOCK_PATIENT_ITEM} />
          </div>
        )}

        {/* DESIGN C: Glassmorphic Minimal Card */}
        {(activeView === 'ALL' || activeView === 'C') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400">DESIGN C</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Modern Glassmorphic Dashboard Card (Minimal & Spacious)</h2>
            </div>
            <GlassmorphicReviewCard item={MOCK_PATIENT_ITEM} />
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DESIGN A: Structured Command Review Card
// -------------------------------------------------------------
function CommandReviewCard({ item }: { item: any }) {
  const [action, setAction] = useState<'APPROVE' | 'MODIFY' | 'OVERRIDE' | 'REJECT'>('APPROVE');
  
  return (
    <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition">
      {/* Grid Layout: Sidebar Left & Reasoning Right */}
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-800">
        
        {/* Left Demographics Panel */}
        <div className="p-5 space-y-4 bg-slate-50/50 dark:bg-zinc-950/20">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{item.visit.patient.name}</h3>
              <span className="text-xs font-semibold text-slate-400">({item.visit.patient.age}/{item.visit.patient.gender})</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Blood Group: <span className="font-semibold">{item.visit.patient.bloodGroup}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border dark:border-zinc-800/80">
              <span className="block text-[9px] font-bold text-slate-400 uppercase">SpO2 Status</span>
              <span className="text-sm font-extrabold text-red-500 animate-pulse">93% (Hypoxic)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border dark:border-zinc-800/80">
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Heart Rate</span>
              <span className="text-sm font-extrabold text-amber-500">112 bpm</span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Intake Safety Flags</span>
            <div className="flex flex-wrap gap-1.5">
              {item.redFlags.map((flag: string) => (
                <span key={flag} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-critical dark:bg-red-950/30 dark:text-red-400 border dark:border-zinc-800">
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Clinical Graph Panel */}
        <div className="p-5 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Recommended Route</p>
              <h4 className="text-sm font-extrabold text-brand-700 dark:text-brand-400 flex items-center gap-1.5 mt-0.5">
                <CornerDownRight className="h-4 w-4" />
                {item.visit.routing?.selectedHospital?.name} — {item.recommendedDepartment}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge bg-red-100 text-critical dark:bg-red-950/40 dark:text-red-400">CRITICAL SAFETY TRIGGER</span>
              <SeverityBadge severity={item.finalSeverity} />
              <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">conf {Math.round(item.aiConfidence * 100)}%</span>
            </div>
          </div>

          {/* AI Clinical reasoning box */}
          <div className="p-3.5 bg-blue-50/30 dark:bg-zinc-950/60 border border-blue-100/50 dark:border-zinc-800 rounded-xl">
            <h5 className="text-[10px] font-extrabold text-blue-800 dark:text-brand-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              AI Clinical Reasoning & Safety Analysis
            </h5>
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
              {item.reasoning.reasoningText}
            </p>
          </div>

          {/* Evidence sources list */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Grounding Guidance:</span>
            {item.citations.map((c: any) => (
              <div key={c.chunkId} className="group relative">
                <span className="cursor-help px-2 py-0.5 border border-slate-200 dark:border-zinc-800 rounded text-[10px] font-bold bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-350">
                  {c.source} ({Math.round(c.score * 100)}%)
                </span>
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-30">
                  <h4 className="font-bold text-[10px] text-slate-800 dark:text-zinc-100 mb-1">{c.title}</h4>
                  <p className="text-[9px] text-slate-500 dark:text-zinc-400 leading-relaxed max-h-24 overflow-y-auto bg-slate-50 dark:bg-zinc-900/60 p-1.5 rounded">
                    {c.snippet}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button Action Bar */}
      <div className="px-5 py-3.5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'APPROVE', label: 'Approve AI', color: 'hover:bg-green-500 hover:text-white dark:hover:bg-green-600' },
            { id: 'MODIFY', label: 'Modify Case', color: 'hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600' },
            { id: 'OVERRIDE', label: 'Override Severity', color: 'hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600' },
            { id: 'REJECT', label: 'Reject Assessment', color: 'hover:bg-red-500 hover:text-white dark:hover:bg-red-600' }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setAction(opt.id as any)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-150 ${
                action === opt.id
                  ? 'bg-brand-700 text-white border-brand-700 dark:bg-brand-600 dark:border-brand-600'
                  : `border-slate-200 bg-white text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 ${opt.color}`
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button className="btn-primary px-4 py-2 text-xs font-bold shadow-md shadow-brand-500/10">
          Sign Off Case
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DESIGN B: Narrative Timeline Review Card
// -------------------------------------------------------------
function TimelineReviewCard({ item }: { item: any }) {
  const [action, setAction] = useState<'APPROVE' | 'MODIFY' | 'OVERRIDE' | 'REJECT'>('APPROVE');
  const [justification, setJustification] = useState('');

  return (
    <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-md transition grid md:grid-cols-4 gap-6">
      
      {/* 3/4 Width: Vertical Journey Flow */}
      <div className="md:col-span-3 space-y-6">
        
        {/* Timeline Item 1: Patient Admission Info */}
        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-zinc-800">
          <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-brand-500"></div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">Patient Intake Admission</h4>
            <span className="text-xs text-slate-400">Registered: Krit Mukul ({item.visit.patient.age} y/o Male)</span>
          </div>
          
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-zinc-300">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-850">
              <span className="text-slate-400 block">Temperature</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">38.2°C (Fever)</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-850">
              <span className="text-slate-400 block">Pulse Rate</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">112 bpm</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-850">
              <span className="text-slate-400 block">SpO2 Oxygen</span>
              <span className="font-bold text-red-500">93% (Hypoxia)</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-850">
              <span className="text-slate-400 block">Blood Pressure</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">142/88 mmHg</span>
            </div>
          </div>
        </div>

        {/* Timeline Item 2: AI Guideline Diagnosis Graph */}
        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-zinc-800">
          <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-blue-500"></div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>AI Guidelines Diagnostics</span>
              <span className="text-[10px] text-slate-400 lowercase">(confidence {Math.round(item.aiConfidence * 100)}%)</span>
            </h4>
            <div className="flex items-center gap-1.5">
              <SeverityBadge severity={item.finalSeverity} />
            </div>
          </div>

          <p className="text-xs text-slate-650 dark:text-zinc-350 italic mt-2 p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/50 dark:border-zinc-850/60 leading-relaxed font-medium">
            "{item.reasoning.reasoningText}"
          </p>
        </div>

        {/* Timeline Item 3: Recommended Smart Routing */}
        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-zinc-800 last:border-0 pb-2">
          <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-emerald-500"></div>
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">Smart Routing Target</h4>
          
          <div className="mt-2 p-3 rounded-xl bg-emerald-50/30 dark:bg-zinc-950/60 border border-emerald-100/60 dark:border-zinc-800 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5 font-bold text-emerald-800 dark:text-brand-400">
              <span className="flex items-center gap-1"><Hospital className="h-4 w-4" /> {item.visit.routing?.selectedHospital?.name}</span>
              <span>{item.recommendedDepartment}</span>
            </div>
            <p className="text-slate-550 dark:text-zinc-400 leading-relaxed font-medium">
              {item.visit.routing?.rankedCandidates[0].reasoning}
            </p>
          </div>
        </div>
      </div>

      {/* 1/4 Width Right Sidebar: Action Drawer Card */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Clinical Sign-Off</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Please review AI inputs and select action</p>
          </div>

          <div className="space-y-2">
            <label className="label text-[10px] uppercase">Review Decision</label>
            <select 
              value={action} 
              onChange={(e) => setAction(e.target.value as any)}
              className="input w-full dark:bg-zinc-900 border-slate-300 dark:border-zinc-800 text-xs"
            >
              <option value="APPROVE">APPROVE ASSESS</option>
              <option value="MODIFY">MODIFY DEPT</option>
              <option value="OVERRIDE">OVERRIDE ESI</option>
              <option value="REJECT">REJECT CASE</option>
            </select>
          </div>

          {action !== 'APPROVE' && (
            <div className="space-y-2 animate-scale-in">
              <label className="label text-[10px] uppercase">Justification</label>
              <textarea 
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Reason required..."
                className="input w-full dark:bg-zinc-900 border-slate-300 dark:border-zinc-800 text-xs h-16 resize-none"
              />
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <button className="btn-primary w-full py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>Confirm & Route</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DESIGN C: Glassmorphic Review Card
// -------------------------------------------------------------
function GlassmorphicReviewCard({ item }: { item: any }) {
  const [action, setAction] = useState<'APPROVE' | 'MODIFY' | 'OVERRIDE' | 'REJECT'>('APPROVE');
  const [justification, setJustification] = useState('');

  return (
    <div className="relative group overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Background glowing shape */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-bl-full pointer-events-none group-hover:scale-105 transition-all"></div>
      
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4 mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{item.visit.patient.name}</h3>
            <span className="text-xs font-semibold text-slate-450 dark:text-zinc-500">M / 20 yrs</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1 text-brand-700 dark:text-brand-400">
            <TrendingUp className="h-3 w-3" />
            Suggested Destination: {item.visit.routing?.selectedHospital?.name} ({item.recommendedDepartment})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Severity Index</span>
            <span className="inline-flex mt-0.5"><SeverityBadge severity={item.finalSeverity} /></span>
          </div>
          <div className="text-center p-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border dark:border-zinc-850">
            <span className="block text-[8px] font-extrabold text-slate-450 uppercase tracking-widest">Conf</span>
            <span className="text-xs font-black text-slate-800 dark:text-zinc-200">{Math.round(item.aiConfidence * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 text-xs mb-4">
        <div className="p-3 bg-white/60 dark:bg-zinc-900/60 rounded-xl border border-slate-100 dark:border-zinc-800/80">
          <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-1">Safety Rule Alerts</span>
          <p className="text-xs text-red-500 font-bold leading-normal">
            Critical flags triggered. border SpO2 indicates hypoxia risk.
          </p>
        </div>
        <div className="p-3 bg-white/60 dark:bg-zinc-900/60 rounded-xl border border-slate-100 dark:border-zinc-800/80 sm:col-span-2">
          <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-1">AI Clinical Grounds</span>
          <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
            {item.reasoning.reasoningText}
          </p>
        </div>
      </div>

      {/* Citations evidence bar */}
      <div className="mb-5 flex flex-wrap items-center gap-2 bg-slate-50/60 dark:bg-zinc-950/40 p-2.5 rounded-xl border dark:border-zinc-850">
        <span className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase tracking-wider">Clinical Guidance Evidence:</span>
        {item.citations.map((c: any) => (
          <span key={c.chunkId} className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border dark:border-zinc-800">
            {c.source} ({Math.round(c.score * 100)}%)
          </span>
        ))}
      </div>

      {/* Integrated Controls Row */}
      <div className="flex flex-wrap items-center gap-4 justify-between border-t border-slate-100 dark:border-zinc-800 pt-4">
        <div className="flex items-center gap-4 flex-1 min-w-[260px]">
          <div className="w-36">
            <select 
              value={action} 
              onChange={(e) => setAction(e.target.value as any)}
              className="input w-full dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-xs font-semibold h-9"
            >
              <option value="APPROVE">Approve AI</option>
              <option value="MODIFY">Modify Dept</option>
              <option value="OVERRIDE">Override Severity</option>
              <option value="REJECT">Reject Assessment</option>
            </select>
          </div>
          {action !== 'APPROVE' && (
            <input
              type="text"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Clinical reason required for override/modify..."
              className="input flex-1 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-xs h-9 animate-scale-in"
            />
          )}
        </div>

        <button className="btn-primary px-5 py-2 text-xs font-extrabold rounded-lg shadow-sm">
          Confirm Case Sign-Off
        </button>
      </div>
    </div>
  );
}
