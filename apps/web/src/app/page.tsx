'use client';

import Link from 'next/link';
import { Activity, ShieldCheck, Stethoscope, Hospital, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const features = [
  { 
    icon: ShieldCheck, 
    title: 'Deterministic Safety Layer', 
    desc: 'Hard clinical safety filters run prior to any LLM query, guaranteeing deterministic triage overrides for critical vitals.',
    badge: 'Fail-safe'
  },
  { 
    icon: Stethoscope, 
    title: 'AI-Assisted Triage Graph', 
    desc: 'Grounded in WHO, ICMR, MTS, and ESI guidelines with full citation matching. A clinical specialist remains in complete control.',
    badge: 'Clinical RAG'
  },
  { 
    icon: Hospital, 
    title: 'Dynamic Hospital Routing', 
    desc: 'Optimally routes patients based on live bed availability, distance, clinical specializations, and essential equipment inventory.',
    badge: 'Multi-Criteria'
  },
  { 
    icon: Activity, 
    title: 'Immutable Audit Ledger', 
    desc: 'Maintains an immutable record of all triage recommendations, doctor override justifications, and clinical transactions.',
    badge: 'Compliance'
  },
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
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-200 overflow-x-hidden relative">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none dark:bg-brand-500/5"></div>
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none dark:bg-emerald-500/5"></div>

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-50/70 dark:bg-zinc-950/70 border-b border-slate-200 dark:border-zinc-900/60 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-600 rounded-lg text-white shadow-md shadow-brand-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-brand-700 dark:from-white dark:via-zinc-200 dark:to-brand-400 bg-clip-text text-transparent">
              JeevanSetu
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-900/80 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.83l.707.707m12.83 12.83l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
              )}
            </button>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-700 text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-500 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-[0.98] transition-all"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50 mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            Active Clinical Co-Pilot
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl leading-[1.1] mb-6">
          AI-Assisted Clinical Triage <br/>
          <span className="bg-gradient-to-r from-brand-600 to-emerald-500 dark:from-brand-400 dark:to-emerald-400 bg-clip-text text-transparent">
            With Human-in-the-Loop
          </span>
        </h1>

        <p className="max-w-2xl text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed mb-8">
          Empowering emergency departments with guideline-grounded severity assessment and intelligent hospital routing. Real-time clinical workflows that prioritize critical cases securely.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link 
            href="/dashboard" 
            className="px-6 py-3 text-base font-bold rounded-xl bg-brand-700 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-500 text-white shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30 hover:translate-y-[-2px] transition-all duration-200"
          >
            Launch Platform
          </Link>
          <a 
            href="#features" 
            className="px-6 py-3 text-base font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 hover:translate-y-[-2px] transition-all duration-200"
          >
            Explore Features
          </a>
        </div>

        {/* Feature Grid Banner */}
        <div id="features" className="w-full grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
          {features.map((f) => (
            <div 
              key={f.title} 
              className="group relative bg-white dark:bg-zinc-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-900 hover:border-brand-500/50 dark:hover:border-brand-500/40 shadow-sm hover:shadow-lg dark:hover:bg-zinc-900 hover:translate-y-[-4px] transition-all duration-300 text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-xl text-brand-600 dark:text-brand-500 group-hover:bg-brand-500 group-hover:text-white dark:group-hover:bg-brand-500 transition-all duration-300">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-950 px-2 py-0.5 rounded">
                    {f.badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety Notice Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-900/80 bg-slate-100/50 dark:bg-zinc-950 py-8 transition-colors">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
            <span>Deterministic Triage Safe-Switch Active</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-md">
            JeevanSetu never makes autonomous diagnostic or triage decisions. Every suggestion is grounded in established medical guidelines and must be confirmed by a licensed clinician.
          </p>
        </div>
      </footer>
    </div>
  );
}
