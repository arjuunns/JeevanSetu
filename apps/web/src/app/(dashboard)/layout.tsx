'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ClipboardList, LayoutDashboard, Stethoscope, Hospital, BarChart3, Languages } from 'lucide-react';
import type { ReactNode } from 'react';

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

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 sm:block flex flex-col justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 px-2 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-brand-700" />
              <span className="text-lg font-bold text-slate-900">{t('platformTitle')}</span>
            </div>
          </div>
          
          <div className="mt-4 px-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Languages className="h-3 w-3" />
              <span>{t('language')}</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 outline-none focus:border-brand-500 transition duration-150"
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
                    active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {t(item.translationKey)}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6">{children}</main>
      
      {activeAlert && (
        <EmergencyToast alert={activeAlert} onDismiss={dismissAlert} />
      )}
    </div>
  );
}

