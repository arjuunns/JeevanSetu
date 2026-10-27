'use client';

import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  Bell,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Radio,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const vitals = [
  { label: 'ACTIVE CASES', value: '47', trend: '+6', color: 'text-cyan-300' },
  { label: 'CRITICAL', value: '03', trend: 'LIVE', color: 'text-rose-400', pulse: true },
  { label: 'AVG ROUTE TIME', value: '4.2m', trend: '-18%', color: 'text-emerald-400' },
  { label: 'AI CONFIDENCE', value: '96.8%', trend: '+0.4%', color: 'text-violet-300' },
];

const feed = [
  { t: '00:02:14', icon: AlertTriangle, text: 'PT-2841 escalated to ESI-1 — SpO₂ 88%, deterministic override engaged', tone: 'text-rose-400' },
  { t: '00:04:37', icon: Ambulance, text: 'Ambulance AMB-12 dispatched → AIIMS Trauma, ETA 4 min', tone: 'text-cyan-300' },
  { t: '00:06:02', icon: BrainCircuit, text: 'Triage graph matched WHO/ICMR guideline set · 3 citations attached', tone: 'text-violet-300' },
  { t: '00:08:51', icon: ShieldCheck, text: 'Dr. Rao confirmed recommendation for PT-2842 (override: none)', tone: 'text-emerald-400' },
  { t: '00:11:26', icon: Zap, text: 'Bed capacity synced across 12 network hospitals', tone: 'text-slate-400' },
];

const hospitals = [
  { name: 'AIIMS Trauma Center', beds: 6, load: 86, status: 'ACCEPTING' },
  { name: 'Safdarjung ER', beds: 14, load: 64, status: 'ACCEPTING' },
  { name: 'RML Wing B', beds: 22, load: 38, status: 'OPTIMAL' },
  { name: 'GTB Hospital', beds: 0, load: 97, status: 'DIVERT' },
];

export default function CommandDesignPage() {
  return (
    <div className="min-h-screen bg-[#05070d] text-slate-200 relative overflow-x-hidden font-mono">
      {/* Grid backdrop */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top command bar */}
      <nav className="sticky top-0 z-50 border-b border-cyan-500/15 bg-[#05070d]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-md text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.25)]">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-widest text-sm text-white">JEEVANSETU</span>
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-cyan-500/80 border border-cyan-500/25 rounded px-2 py-0.5">
              <Radio className="w-3 h-3 animate-pulse" /> OPS-LIVE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:block text-[11px] text-slate-500 tracking-wider">SHIFT: NIGHT-A · DR. RAO</span>
            <button className="relative p-2 rounded-md border border-slate-700/80 hover:border-cyan-500/40 transition">
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-[9px] flex items-center justify-center font-bold text-white">3</span>
            </button>
            <Link
              href="/design-styles"
              className="text-xs font-bold tracking-widest border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 rounded-md px-4 py-2 hover:bg-cyan-500/20 shadow-[0_0_16px_rgba(34,211,238,0.15)] transition"
            >
              ← STYLES
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-5 py-10">
        {/* Header strip */}
        <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-cyan-500/70 mb-2">EMERGENCY TRIAGE COMMAND CENTER</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Night Shift <span className="text-cyan-400">//</span> Live Ops
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400/90">SAFETY LAYER ARMED</span>
            <span className="text-slate-600 mx-1">|</span>
            <span className="text-slate-500">ALL SYSTEMS NOMINAL</span>
          </div>
        </section>

        {/* Vitals row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {vitals.map((v) => (
            <div key={v.label} className="group relative border border-slate-800 bg-slate-900/40 backdrop-blur-sm p-5 rounded-lg hover:border-cyan-500/30 transition-colors overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[10px] tracking-[0.2em] text-slate-500">{v.label}</p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className={`text-3xl font-bold tabular-nums ${v.color}`}>{v.value}</span>
                <span className={`text-[10px] ${v.pulse ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`}>{v.trend}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Main ops grid */}
        <section className="grid lg:grid-cols-5 gap-3 mb-6">
          {/* Critical case card */}
          <div className="lg:col-span-2 border border-rose-600/30 bg-gradient-to-b from-rose-950/30 to-slate-900/40 rounded-lg p-6 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-pulse" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.25em] text-rose-400">PRIORITY-1 ESCALATION</span>
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
            </div>
            <div className="mt-5 flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-rose-500/50 flex items-center justify-center bg-rose-950/40">
                  <span className="text-2xl font-bold text-rose-400">94</span>
                </div>
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgb(244 63 94 / 0.7)" strokeWidth="4" strokeDasharray="289" strokeDashoffset="17" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg">R. SHARMA</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  PT-2841 · 54M<br />
                  HR 128 · SpO₂ 88%<br />
                  Suspected STEMI
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-[11px]">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5"><span className="text-slate-500">ROUTED TO</span><span className="text-cyan-300">AIIMS TRAUMA · ICU-3</span></div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5"><span className="text-slate-500">ETA</span><span className="text-white">4 MIN</span></div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5"><span className="text-slate-500">GUIDELINE MATCH</span><span className="text-violet-300">WHO ACS · 99%</span></div>
            </div>
            <div className="mt-5 flex gap-2">
              <button className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold tracking-widest py-2.5 rounded-md shadow-[0_0_20px_rgba(244,63,94,0.3)] transition">ACKNOWLEDGE</button>
              <button className="flex-1 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-bold tracking-widest py-2.5 rounded-md transition">OPEN FILE →</button>
            </div>
          </div>

          {/* Event feed */}
          <div className="lg:col-span-3 border border-slate-800 bg-slate-900/40 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] tracking-[0.25em] text-slate-500">SYSTEM EVENT STREAM</span>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> STREAMING</span>
            </div>
            <div className="space-y-4 max-h-[19rem] overflow-y-auto pr-2 [scrollbar-width:thin]">
              {feed.map((e, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <e.icon className={`w-4 h-4 mt-0.5 shrink-0 ${e.tone}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 leading-relaxed group-hover:text-white transition-colors">{e.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 shrink-0">{e.t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hospital fleet */}
        <section className="border border-slate-800 bg-slate-900/40 backdrop-blur-sm rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] tracking-[0.25em] text-slate-500">HOSPITAL NETWORK STATUS</span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {hospitals.map((h) => (
              <div key={h.name} className={`border rounded-md p-4 ${h.status === 'DIVERT' ? 'border-rose-600/40 bg-rose-950/20' : 'border-slate-800 bg-slate-900/60'} hover:border-cyan-500/30 transition-colors`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white truncate">{h.name}</p>
                  <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
                    h.status === 'ACCEPTING' ? 'bg-emerald-500/10 text-emerald-400' : h.status === 'OPTIMAL' ? 'bg-cyan-500/10 text-cyan-300' : 'bg-rose-500/10 text-rose-400'
                  }`}>{h.status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                  <span>BEDS FREE: <span className={h.beds === 0 ? 'text-rose-400' : 'text-white'}>{h.beds}</span></span>
                  <span>{h.load}% LOAD</span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${h.load > 90 ? 'bg-rose-500' : h.load > 70 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${h.load}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pb-8 flex items-center justify-between text-[10px] tracking-[0.2em] text-slate-600">
          <span>HUMAN-IN-THE-LOOP ENFORCED · NO AUTONOMOUS DECISIONS</span>
          <Link href="/design-styles" className="text-cyan-500/70 hover:text-cyan-300 transition-colors">VIEW ALL DESIGN STYLES →</Link>
        </footer>
      </main>
    </div>
  );
}
