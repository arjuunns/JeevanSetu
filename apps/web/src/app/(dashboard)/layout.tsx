'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ClipboardList, LayoutDashboard, Stethoscope, Hospital, BarChart3, Languages, Sun, Moon, Menu, X } from 'lucide-react';
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
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </LanguageProvider>
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

  return (
    <div className="flex flex-col sm:flex-row min-h-screen transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 sm:flex flex-col justify-between dark:border-zinc-800 dark:bg-zinc-950 h-screen sticky top-0">
        <div className="flex-1 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2 px-2 py-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-brand-700 dark:text-brand-500" />
                <span className="text-lg font-bold text-slate-900 dark:text-white">{t('platformTitle')}</span>
              </div>
            </div>
            
            <div className="mt-4 px-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                <Languages className="h-3 w-3" />
                <span>{t('language')}</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 outline-none focus:border-brand-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 transition duration-150"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              </select>
            </div>

            <nav className="mt-6 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href as never}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                      active 
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400' 
                        : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {t(item.translationKey)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-zinc-800">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200 transition"
            >
              <div className="flex items-center gap-3">
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 dark:text-zinc-350">
                {theme}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sm:hidden flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sticky top-0 z-40 w-full shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-brand-700 dark:text-brand-500" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">{t('platformTitle')}</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-50 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-900 transition"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Sidebar Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer Content */}
          <aside className="relative flex w-64 max-w-xs flex-col justify-between border-r border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 h-full shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex-1 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between gap-2 px-2 py-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Activity className="h-6 w-6 text-brand-700 dark:text-brand-500" />
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{t('platformTitle')}</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-4 px-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    <Languages className="h-3 w-3" />
                    <span>{t('language')}</span>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 outline-none focus:border-brand-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 transition duration-150"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                  </select>
                </div>

                <nav className="mt-6 space-y-1">
                  {navItems.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href as never}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                          active 
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400' 
                            : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200',
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {t(item.translationKey)}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 dark:border-zinc-800">
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200 transition"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 dark:text-zinc-350">
                    {theme}
                  </span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-zinc-950 transition-colors duration-200">{children}</main>
      
      {activeAlert && (
        <EmergencyToast alert={activeAlert} onDismiss={dismissAlert} />
      )}
    </div>
  );
}

