'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ClipboardList, LayoutDashboard, Stethoscope, Hospital, BarChart3, Languages, Menu, X, Sparkles } from 'lucide-react';
import { type ReactNode, useState, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { LanguageProvider, useTranslation } from '@/context/LanguageContext';
import { useEmergencySocket } from '@/hooks/useEmergencySocket';
import { EmergencyToast } from '@/components/EmergencyToast';

const navItems = [
  { href: '/dashboard', translationKey: 'overview' as const, icon: LayoutDashboard },
  { href: '/intake', translationKey: 'patientIntake' as const, icon: ClipboardList },
  { href: '/review', translationKey: 'doctorReview' as const, icon: Stethoscope },
  { href: '/hospitals', translationKey: 'hospitals' as const, icon: Hospital },
  { href: '/analytics', translationKey: 'cmoAnalytics' as const, icon: BarChart3 },
  { href: '/genai-usage', translationKey: 'genaiUsage' as const, icon: Sparkles },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </LanguageProvider>
  );
}

function SidebarInner({
  pathname,
  language,
  setLanguage,
  t,
  theme,
  toggleTheme,
  onNavigate,
}: {
  pathname: string;
  language: string;
  setLanguage: (l: any) => void;
  t: (k: any) => string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2.5 px-3 py-4 border-b border-neutral-200 dark:border-zinc-800">
          <Activity className="h-5 w-5 text-teal-700 dark:text-teal-500" strokeWidth={2.25} />
          <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">{t('platformTitle')}</span>
        </div>

        <p className="eyebrow px-3 mt-6 mb-2 dark:text-zinc-600">/ Workspace</p>
        <nav className="px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href as never}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-2.5 border-l-2 py-1.5 pl-2.5 pr-3 text-sm transition-colors',
                  active
                    ? 'border-neutral-900 font-semibold text-neutral-900 dark:border-white dark:text-white'
                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100',
                )}
              >
                <item.icon className="h-4 w-4" strokeWidth={active ? 2.25 : 1.75} />
                <span className={cn(active && 'font-mono text-[13px] uppercase tracking-wide')}>{t(item.translationKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 px-3">
          <label className="eyebrow flex items-center gap-1.5 mb-2 dark:text-zinc-600">
            <Languages className="h-3 w-3" />
            <span>{t('language')}</span>
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="w-full rounded-md border border-neutral-200 bg-transparent px-2 py-1.5 font-mono text-xs text-neutral-700 outline-none focus:border-teal-700 dark:border-zinc-800 dark:text-zinc-300 transition"
          >
            <option value="en">EN — English</option>
            <option value="hi">HI — हिन्दी</option>
            <option value="pa">PA — ਪੰਜਾਬੀ</option>
          </select>
        </div>
      </div>

      <div className="mt-auto border-t border-neutral-200 dark:border-zinc-800 pt-4 pb-2 px-3 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-md px-1 py-1 font-mono text-[11px] uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:text-zinc-400 dark:hover:text-white transition"
        >
          <span>[{theme === 'light' ? 'Dark mode' : 'Light mode'}]</span>
          <span className="text-neutral-300 dark:text-zinc-700">{theme === 'light' ? '○' : '●'}</span>
        </button>
        <p className="text-[10px] font-mono text-neutral-300 dark:text-zinc-700 leading-relaxed">
          Human-in-the-loop enforced.<br />No autonomous decisions.
        </p>
      </div>
    </div>
  );
}

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useTranslation();
  const { activeAlert, dismissAlert } = useEmergencySocket();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = (saved as 'light' | 'dark') || system;
    setTheme(initial);
    if (initial === 'dark') {
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

  const sidebarProps = { pathname, language, setLanguage, t, theme, toggleTheme };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0a] transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-neutral-200 bg-white p-3 sm:flex flex-col justify-between dark:border-zinc-800 dark:bg-zinc-950 h-screen sticky top-0 transition-colors">
        <SidebarInner {...sidebarProps} />
      </aside>

      {/* Mobile Header */}
      <header className="sm:hidden flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sticky top-0 z-40 w-full shrink-0">
        <div className="flex items-center gap-2.5">
          <Activity className="h-5 w-5 text-teal-700 dark:text-teal-500" />
          <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">{t('platformTitle')}</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-900 transition"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Sidebar Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex">
          <div
            className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative flex w-64 max-w-xs flex-col justify-between border-r border-neutral-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 h-full shadow-xl animate-in slide-in-from-left duration-200">
            <SidebarInner {...sidebarProps} onNavigate={() => setIsMobileMenuOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 transition-colors duration-200">{children}</main>

      {activeAlert && (
        <EmergencyToast alert={activeAlert} onDismiss={dismissAlert} />
      )}
    </div>
  );
}
