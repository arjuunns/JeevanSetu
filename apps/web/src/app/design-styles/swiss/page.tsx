'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Minus } from 'lucide-react';

const principles = [
  {
    num: '01',
    title: 'Deterministic Safety',
    desc: 'Hard clinical filters execute before any model inference. Critical vitals trigger overrides that no AI can reverse.',
  },
  {
    num: '02',
    title: 'Guideline Grounding',
    desc: 'Every recommendation cites WHO, ICMR, MTS or ESI. Retrieval is traceable line-by-line to source guidance.',
  },
  {
    num: '03',
    title: 'Human Authority',
    desc: 'The clinician holds final sign-off. The system proposes; a licensed specialist disposes.',
  },
];

const metrics = [
  { label: 'Triage latency', value: '1.2s', delta: '-38%' },
  { label: 'Cases reviewed today', value: '428', delta: '+12%' },
  { label: 'Critical escalations', value: '03', delta: '+2' },
  { label: 'Guideline match', value: '99.4%', delta: '+0.2%' },
];

const queue = [
  ['PT-2841', 'R. Sharma', 'ESI-1', 'ICU-3', '94'],
  ['PT-2842', 'M. Iyer', 'ESI-2', 'ER-7', '71'],
  ['PT-2843', 'A. Khan', 'ESI-3', 'WARD-2', '45'],
  ['PT-2844', 'S. Verma', 'ESI-4', 'WARD-5', '22'],
];

export default function SwissDesignPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-[#fafaf9]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-semibold tracking-tight">JeevanSetu</span>
            <span className="hidden sm:inline text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400 border-l border-neutral-300 pl-3">Clinical Triage Infrastructure</span>
          </div>
          <nav className="flex items-center gap-7">
            <span className="hidden md:block text-sm text-neutral-500 hover:text-neutral-900 cursor-pointer transition-colors">Platform</span>
            <span className="hidden md:block text-sm text-neutral-500 hover:text-neutral-900 cursor-pointer transition-colors">Evidence</span>
            <Link href="/design-styles" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">Styles</Link>
            <Link
              href="/design-styles"
              className="group inline-flex items-center gap-1 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition-colors"
            >
              Console <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {/* Hero — editorial */}
        <section className="pt-24 pb-20 border-b border-neutral-200 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400 mb-6">
              / Human-in-the-loop triage · v0.1
            </p>
            <h1 className="text-5xl sm:text-7xl font-semibold tracking-[-0.04em] leading-[1.02] text-neutral-900">
              Precision is a<br />
              <em className="not-italic text-neutral-400">clinical</em> feature.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-500">
              A restraint-first interface for emergency triage. No decoration without function.
              Every pixel earns its place — because in the ER, attention is the scarcest resource.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <button className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700 transition-colors">
                Open console <ArrowUpRight className="w-4 h-4" />
              </button>
              <button className="text-sm font-medium text-neutral-600 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 transition-colors">
                Read the evidence brief
              </button>
            </div>
          </div>

          {/* Metric stack */}
          <aside className="lg:col-span-4 lg:border-l lg:border-neutral-200 lg:pl-10 flex flex-col justify-center gap-8">
            {metrics.map((m) => (
              <div key={m.label} className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-3xl font-semibold tracking-tight tabular-nums">{m.value}</div>
                  <div className="text-xs uppercase tracking-wider text-neutral-400 mt-1">{m.label}</div>
                </div>
                <span className="mt-1.5 text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">
                  {m.delta}
                </span>
              </div>
            ))}
          </aside>
        </section>

        {/* Principles — numbered editorial list */}
        <section className="py-20 border-b border-neutral-200">
          <div className="flex items-center gap-3 mb-12">
            <Minus className="w-4 h-4 text-teal-700" />
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400">Operating Principles</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-x-10 gap-y-12">
            {principles.map((p) => (
              <article key={p.num} className="border-t-2 border-neutral-900 pt-6 group hover:border-teal-700 transition-colors">
                <span className="font-mono text-sm text-neutral-400 group-hover:text-teal-700 transition-colors">{p.num}</span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500">{p.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Queue table — dense data craft */}
        <section className="py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <Minus className="w-4 h-4 text-teal-700" />
                <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400">Live Queue</h2>
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">Tonight&rsquo;s triage board</h3>
            </div>
            <span className="text-xs font-mono text-neutral-400 tabular-nums">Updated 00:00:04 ago</span>
          </div>

          <div className="rounded-2xl border border-neutral-200 overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/60">
                  {['ID', 'Patient', 'Severity', 'Destination', 'Score'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queue.map(([id, name, esi, dest, score]) => (
                  <tr key={id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/70 transition-colors cursor-pointer">
                    <td className="px-5 py-4 font-mono text-xs text-neutral-400">{id}</td>
                    <td className="px-5 py-4 font-medium">{name}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${esi === 'ESI-1' ? 'text-rose-700' : esi === 'ESI-2' ? 'text-orange-600' : 'text-neutral-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${esi === 'ESI-1' ? 'bg-rose-600' : esi === 'ESI-2' ? 'bg-orange-500' : 'bg-neutral-300'}`} />
                        {esi}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-neutral-500">{dest}</td>
                    <td className="px-5 py-4 tabular-nums font-semibold">{score}<span className="text-neutral-300 font-normal">/100</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs font-mono text-neutral-400">
            fig. 01 — severity assigned by deterministic layer; physician confirmation pending.
          </p>
        </section>

        {/* Footer */}
        <footer className="py-10 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs font-mono text-neutral-400">JeevanSetu — setu (सेतु): the bridge between symptoms and care.</span>
          <span className="text-xs font-mono text-neutral-400">Design system: Swiss / Editorial</span>
        </footer>
      </main>
    </div>
  );
}
