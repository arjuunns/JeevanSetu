'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

interface HospitalView {
  id: string;
  name: string;
  address: string;
  emergencyLevel: string;
  isTraumaCenter: boolean;
  capacity?: {
    icuBedsAvailable: number;
    generalBedsAvailable: number;
    ventilatorsAvailable: number;
  } | null;
  departments: { id: string; name: string }[];
  _count: { specialists: number };
}

/** Phase 9 — Hospital management list with live capacity. */
export default function HospitalsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['hospitals'],
    queryFn: () => api.get<HospitalView[]>('/hospitals'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{t('hospitals')}</h1>
      <p className="mt-1 text-sm text-slate-500">{t('hospitalCapacitySubtitle')}</p>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-500">{t('loading')}</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(data ?? []).map((h) => (
            <div key={h.id} className="card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{h.name}</h3>
                {h.isTraumaCenter ? <span className="badge bg-red-100 text-critical">{t('traumaCenter')}</span> : null}
              </div>
              <p className="mt-1 text-sm text-slate-500">{h.address}</p>
              <p className="mt-1 text-xs text-slate-400">{t('emergencyLevel')}: {h.emergencyLevel}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <Capacity label={t('icuBeds')} value={h.capacity?.icuBedsAvailable} />
                <Capacity label={t('generalBeds')} value={h.capacity?.generalBedsAvailable} />
                <Capacity label="Ventilators" value={h.capacity?.ventilatorsAvailable} />
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {h.departments.length} departments · {h._count.specialists} specialists
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Capacity({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <p className="text-lg font-bold text-slate-900">{value ?? 0}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
