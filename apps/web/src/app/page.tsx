'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

const features = [
  {
    num: '01',
    title: 'Deterministic Safety Layer',
    desc: 'Hard clinical safety filters execute before any model inference. Critical vitals trigger deterministic overrides that no AI can reverse.',
    badge: 'Fail-safe',
  },
  {
    num: '02',
    title: 'Guideline-Grounded Triage',
    desc: 'Every recommendation cites WHO, ICMR, MTS or ESI. Retrieval is traceable line-by-line to the source guidance document.',
    badge: 'Clinical RAG',
  },
  {
    num: '03',
    title: 'Dynamic Hospital Routing',
    desc: 'Patients are routed on live bed availability, distance, clinical specialization and essential equipment — recomputed in real time.',
    badge: 'Multi-Criteria',
  },
  {
    num: '04',
    title: 'Immutable Audit Ledger',
    desc: 'An immutable record of every triage recommendation, physician override and clinical transaction. Compliance by construction.',
    badge: 'Compliance',
  },
];

const metrics = [
  { label: 'Triage latency', value: '1.2s' },
  { label: 'Guideline match', value: '99.4%' },
  { label: 'Human sign-off', value: '100%' },
];

export default function LandingPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const current = saved || system;
    setTheme(current as 'light' | 'dark');
    if (current === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-neutral-900 antialiased dark:bg-[#0a0a0a] dark:text-zinc-100 transition-colors duration-200">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-[#fafaf9]/85 backdrop-blur-md dark:border-zinc-800 dark:bg-[#0a0a0a]/85 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-semibold tracking-tight dark:text-white">JeevanSetu</span>
            <span className="hidden sm:inline text-[11px] font-mono uppercase tracking-[0.14em] text-neutral-400 border-l border-neutral-300 dark:border-zinc-700 pl-3">
              Clinical Triage Infrastructure
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              aria-label="Toggle Theme"
            >
              [{theme === 'light' ? 'Dark' : 'Light'}]
            </button>
            <Link
              href="/design-styles"
              className="hidden md:block text-sm text-neutral-500 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              Design notes
            </Link>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-1 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-teal-400 transition-colors"
            >
              Console <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {/* Hero — editorial split */}
        <section className="pt-24 pb-20 border-b border-neutral-200 dark:border-zinc-800 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-6 dark:text-zinc-500">/ Human-in-the-loop triage · v0.1</p>
            <h1 className="text-5xl sm:text-7xl font-semibold tracking-[-0.04em] leading-[1.02] dark:text-white">
              Precision is a<br />
              <em className="not-italic text-neutral-400 dark:text-zinc-500">clinical</em> feature.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-500 dark:text-zinc-400">
              AI-assisted emergency triage, referral and hospital routing — grounded in
              established guidelines, confirmed by a licensed clinician. No decoration
              without function; no decision without a human.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-teal-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-teal-400 transition-colors"
              >
                Open console <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <a
                href="#principles"
                className="text-sm font-medium text-neutral-600 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 dark:text-zinc-400 dark:hover:decoration-white transition-colors"
              >
                Read the operating principles
              </a>
            </div>
          </div>

          {/* Metric stack */}
          <aside className="lg:col-span-4 lg:border-l lg:border-neutral-200 lg:pl-10 flex flex-col justify-center gap-8 dark:border-zinc-800">
            {metrics.map((m) => (
              <div key={m.label}>
                <div className="text-3xl font-semibold tracking-tight tabular dark:text-white">{m.value}</div>
                <div className="eyebrow mt-1 dark:text-zinc-500">{m.label}</div>
              </div>
            ))}
          </aside>
        </section>

        {/* Principles — numbered editorial list */}
        <section id="principles" className="py-20 border-b border-neutral-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-12">
            <Minus className="w-4 h-4 text-teal-700 dark:text-teal-500" />
            <h2 className="eyebrow dark:text-zinc-500">Operating Principles</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-x-10 gap-y-12">
            {features.map((p) => (
              <article key={p.num} className="border-t-2 border-neutral-900 pt-6 group hover:border-teal-700 dark:border-white dark:hover:border-teal-500 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-neutral-400 dark:text-zinc-500 group-hover:text-teal-700 dark:group-hover:text-teal-500 transition-colors">{p.num}</span>
                  <span className="badge border border-neutral-200 text-neutral-500 dark:border-zinc-800 dark:text-zinc-500">{p.badge}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight dark:text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-zinc-400 max-w-md">{p.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs font-mono text-neutral-400 dark:text-zinc-600">
            setu (सेतु) — the bridge between symptoms and care.
          </span>
          <span className="text-xs font-mono text-neutral-400 dark:text-zinc-600">
            JeevanSetu never acts autonomously · clinician confirms every decision
          </span>
        </footer>
      </main>
    </div>
  );
}
