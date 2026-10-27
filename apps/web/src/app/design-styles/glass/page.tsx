'use client';

import Link from 'next/link';
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  Hospital,
  ArrowRight,
  CheckCircle2,
  Bell,
  Search,
  HeartPulse,
  Brain,
  Ambulance,
} from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Safety Layer',
    desc: 'Deterministic overrides for critical vitals before any AI runs.',
    accent: 'from-cyan-400/20 to-blue-500/10',
    iconColor: 'text-cyan-600',
  },
  {
    icon: Brain,
    title: 'AI Triage Graph',
    desc: 'Grounded in WHO, ICMR, MTS & ESI with full citations.',
    accent: 'from-teal-400/20 to-emerald-500/10',
    iconColor: 'text-teal-600',
  },
  {
    icon: Ambulance,
    title: 'Smart Routing',
    desc: 'Live beds, distance, specialization & equipment matching.',
    accent: 'from-sky-400/20 to-indigo-500/10',
    iconColor: 'text-sky-600',
  },
  {
    icon: HeartPulse,
    title: 'Audit Ledger',
    desc: 'Immutable record of every recommendation and override.',
    accent: 'from-violet-400/20 to-fuchsia-500/10',
    iconColor: 'text-violet-600',
  },
];

const liveCases = [
  { id: 'PT-2841', name: 'R. Sharma', sev: 'CRITICAL', score: 94, bed: 'ICU-3', eta: '4 min', pulse: '128', o2: '88%' },
  { id: 'PT-2842', name: 'M. Iyer', sev: 'HIGH', score: 71, bed: 'ER-7', eta: '11 min', pulse: '104', o2: '95%' },
  { id: 'PT-2843', name: 'A. Khan', sev: 'MODERATE', score: 45, bed: 'WARD-2', eta: '18 min', pulse: '92', o2: '98%' },
];

const sevStyles: Record<string, string> = {
  CRITICAL: 'bg-rose-500/15 text-rose-600 ring-rose-500/30',
  HIGH: 'bg-orange-500/15 text-orange-600 ring-orange-500/30',
  MODERATE: 'bg-amber-500/15 text-amber-600 ring-amber-500/30',
};

export default function GlassDesignPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-teal-50/60 to-sky-100 text-slate-900 relative overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="fixed top-[-15%] left-[-8%] w-[45rem] h-[45rem] rounded-full bg-gradient-to-br from-teal-300/40 to-cyan-200/30 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-25%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-sky-300/35 to-indigo-200/25 blur-[150px] pointer-events-none" />
      <div className="fixed top-[35%] left-[40%] w-[24rem] h-[24rem] rounded-full bg-emerald-200/30 blur-[120px] pointer-events-none animate-pulse" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-6 pt-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between rounded-2xl border border-white/50 bg-white/55 backdrop-blur-2xl shadow-lg shadow-teal-900/5 px-5 h-16">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl text-white shadow-lg shadow-teal-500/30">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Jeevan<span className="text-teal-600">Setu</span></span>
            <span className="ml-1 hidden sm:inline-flex items-center rounded-full bg-teal-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 ring-1 ring-teal-500/20">Glass UI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/60 bg-white/50 px-3 py-2 text-sm text-slate-500 w-52">
              <Search className="w-4 h-4" /> Search patients…
            </div>
            <button className="relative p-2.5 rounded-xl border border-white/60 bg-white/50 hover:bg-white/80 transition">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <Link
              href="/design-styles"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-px active:translate-y-0 transition-all"
            >
              Back <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative max-w-6xl mx-auto px-6 pt-16 pb-24">
        <section className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 backdrop-blur-xl px-4 py-1.5 mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-teal-700">Live Clinical Co-Pilot</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter leading-[1.05] max-w-4xl bg-gradient-to-b from-slate-800 via-slate-800 to-slate-500 bg-clip-text text-transparent">
            Clarity you can
            <span className="block mt-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 bg-clip-text text-transparent">
              see through.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed">
            Frosted-glass surfaces float above living data — triage decisions stay calm,
            legible and beautiful under emergency pressure.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button className="group px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all">
              Launch Triage Console
              <ArrowRight className="inline ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button className="px-7 py-3.5 rounded-2xl border border-white/70 bg-white/55 backdrop-blur-xl font-semibold text-slate-700 hover:bg-white/80 transition shadow-sm">
              View Live Demo
            </button>
          </div>
        </section>

        {/* Floating dashboard mock */}
        <section className="mt-20 grid lg:grid-cols-3 gap-5">
          {/* Live queue table card */}
          <div className="lg:col-span-2 rounded-3xl border border-white/60 bg-white/50 backdrop-blur-2xl p-6 shadow-2xl shadow-teal-900/10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-lg">Live Triage Queue</h3>
                <p className="text-xs text-slate-500 mt-0.5">Auto-prioritized by deterministic safety layer</p>
              </div>
              <div className="flex gap-1.5">
                {['All', 'Critical', 'High'].map((t, i) => (
                  <span key={t} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${i === 0 ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30' : 'bg-white/70 text-slate-500 border border-white/60'}`}>{t}</span>
                ))}
              </div>
            </div>
            <div className="space-y-2.5">
              {liveCases.map((c) => (
                <div key={c.id} className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/65 hover:bg-white/90 px-4 py-3.5 transition cursor-pointer group">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-500 group-hover:from-teal-100 group-hover:to-cyan-50 group-hover:text-teal-600 transition">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{c.name}</span>
                      <span className="text-[10px] text-slate-400">{c.id}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{c.bed} · ETA {c.eta} · HR {c.pulse} · SpO₂ {c.o2}</div>
                  </div>
                  <div className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider ring-1 ${sevStyles[c.sev]}`}>{c.sev}</div>
                  <div className="w-14 text-right">
                    <div className="text-lg font-extrabold text-slate-800">{c.score}</div>
                    <div className="h-1 rounded-full bg-slate-200 overflow-hidden mt-0.5">
                      <div
                        className={`h-full rounded-full ${c.score > 80 ? 'bg-rose-500' : c.score > 60 ? 'bg-orange-400' : 'bg-amber-400'}`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column stack */}
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-rose-500/10 to-orange-400/10 backdrop-blur-2xl p-6 shadow-xl shadow-rose-900/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600">Critical Alert</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-rose-500 opacity-75" />
                  <span className="relative rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
              </div>
              <div className="mt-3 text-4xl font-extrabold text-rose-600">03</div>
              <p className="text-sm text-rose-700/80 mt-1">patients need immediate physician sign-off</p>
              <button className="mt-4 w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold py-2.5 shadow-lg shadow-rose-500/30 transition">
                Review Now
              </button>
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-2xl p-6 shadow-xl shadow-teal-900/5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600">Hospital Network</span>
              <div className="mt-4 space-y-3.5">
                {[
                  { n: 'AIIMS Trauma Center', v: 86 },
                  { n: 'Safdarjung ER', v: 64 },
                  { n: 'RML Wing B', v: 38 },
                ].map((h) => (
                  <div key={h.n}>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span>{h.n}</span><span className="text-slate-400">{h.v}% capacity</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200/70 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-500" style={{ width: `${h.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature glass cards */}
        <section className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="group relative rounded-3xl border border-white/60 bg-white/45 backdrop-blur-2xl p-6 hover:bg-white/70 hover:-translate-y-1.5 transition-all duration-300 shadow-lg shadow-slate-900/5 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <f.icon className={`w-7 h-7 ${f.iconColor}`} />
                <h3 className="mt-4 font-bold">{f.title}</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-20 rounded-3xl border border-white/60 bg-white/45 backdrop-blur-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-slate-900/5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-teal-600" /> Deterministic safety-switch active
          </div>
          <p className="text-xs text-slate-400 max-w-md text-center sm:text-right">
            Every suggestion is grounded in clinical guidelines and confirmed by a licensed clinician.
          </p>
        </footer>
      </main>
    </div>
  );
}
