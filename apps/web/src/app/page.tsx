import Link from 'next/link';
import { Activity, ShieldCheck, Stethoscope, Hospital } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Deterministic Safety Layer', desc: 'Hard clinical red-flag rules run before any AI and always override it.' },
  { icon: Stethoscope, title: 'AI-Assisted Triage', desc: 'Guideline-grounded severity assessment — every output reviewed by a doctor.' },
  { icon: Hospital, title: 'Smart Hospital Routing', desc: 'Ranks hospitals by distance, capacity, specialists, and equipment.' },
  { icon: Activity, title: 'Full Auditability', desc: 'Every action — who, when, before, after — is recorded immutably.' },
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">JeevanSetu</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">
          AI-assisted clinical triage with a human always in the loop
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          JeevanSetu helps healthcare workers collect patient information, assess severity, retrieve
          official guidelines, and route patients to the right hospital — without ever making an
          autonomous medical decision.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/dashboard" className="btn-primary">
            Open dashboard
          </Link>
          <Link href="/sign-in" className="btn-ghost">
            Sign in
          </Link>
        </div>
      </header>

      <section className="mt-16 grid gap-5 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="card">
            <f.icon className="h-6 w-6 text-brand-700" />
            <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
          </div>
        ))}
      </section>

      <p className="mt-16 text-center text-sm text-slate-500">
        The system never makes autonomous medical decisions. Every AI recommendation requires human
        approval.
      </p>
    </main>
  );
}
