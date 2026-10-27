'use client';

import Link from 'next/link';
import { ArrowRight, Activity, Layers, Radar } from 'lucide-react';

const styles = [
  {
    href: '/design-styles/glass',
    name: 'Clinical Glassmorphism',
    tagline: 'Frosted depth. Calm under pressure.',
    desc: 'Translucent surfaces floating over living gradients. Feels premium and modern — ideal for the marketing site, intake flows, and physician-facing screens where trust matters.',
    palette: ['#0d9488', '#06b6d4', '#0ea5e9', '#f8fafc'],
    vibe: 'Apple Health × Linear',
    icon: Layers,
    ring: 'hover:border-teal-500/50 hover:shadow-teal-500/10',
    swatchBg: 'from-teal-400 to-cyan-500',
  },
  {
    href: '/design-styles/swiss',
    name: 'Swiss Editorial Precision',
    tagline: 'Restraint as a feature.',
    desc: 'Grid-driven typography with almost no chrome. Data reads like a printed clinical journal — perfect for evidence review, audit ledgers, and users who equate minimalism with credibility.',
    palette: ['#171717', '#525252', '#a3a3a3', '#14b8a6'],
    vibe: 'Vercel × The BMJ',
    icon: Activity,
    ring: 'hover:border-neutral-900/40 hover:shadow-neutral-900/10',
    swatchBg: 'from-neutral-800 to-neutral-500',
  },
  {
    href: '/design-styles/command',
    name: 'Dark Command Center',
    tagline: 'Built for 3 a.m. emergencies.',
    desc: 'Mission-control density with glowing critical alerts and monospace telemetry. Reduces eye strain on night shifts and makes escalations impossible to miss.',
    palette: ['#22d3ee', '#f43f5e', '#a78bfa', '#34d399'],
    vibe: 'SpaceX ops × Bloomberg Terminal',
    icon: Radar,
    ring: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
    swatchBg: 'from-slate-900 to-cyan-600',
  },
];

export default function DesignStylesHub() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white text-slate-900">
      <main className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-3">JeevanSetu · UI Direction</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Three ways to make it
          <span className="text-teal-600"> professional.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600 leading-relaxed">
          Each demo is a full working preview of the same triage product in a different visual language.
          Open them side by side and pick a direction — they can be mixed (e.g., Glass for marketing,
          Command for the night-shift dashboard).
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {styles.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl ${s.ring} hover:-translate-y-1 transition-all duration-300`}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.swatchBg} p-2.5 text-white mb-5`}>
                <s.icon className="w-full h-full" />
              </div>
              <h2 className="font-bold text-lg group-hover:text-teal-600 transition-colors">{s.name}</h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{s.tagline}</p>
              <p className="text-sm text-slate-500 leading-relaxed mt-3 flex-1">{s.desc}</p>

              <div className="flex gap-1.5 mt-4">
                {s.palette.map((c) => (
                  <span key={c} className="w-6 h-6 rounded-md border border-black/5" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{s.vibe}</span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-900 group-hover:text-teal-600 group-hover:gap-2 transition-all">
                  Preview <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <strong>Recommendation:</strong> Ship <em>Glassmorphism</em> for the public-facing pages +
          <em> Swiss</em> tables inside the dashboard, or go all-in on <em>Command Center</em> if the
          primary user is the ER physician on night shift.
        </div>

        <Link href="/" className="inline-block mt-8 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          ← Back to JeevanSetu
        </Link>
      </main>
    </div>
  );
}
