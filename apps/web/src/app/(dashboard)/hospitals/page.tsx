'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

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
  
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [traumaFilter, setTraumaFilter] = useState('ALL');
  const [bedFilter, setBedFilter] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['hospitals'],
    queryFn: () => api.get<HospitalView[]>('/hospitals'),
  });

  const uniqueLevels = Array.from(new Set((data ?? []).map((h) => h.emergencyLevel))).filter(Boolean);

  const filteredHospitals = (data ?? []).filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) || 
                          h.address.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = !levelFilter || h.emergencyLevel === levelFilter;
    const matchesTrauma = traumaFilter === 'ALL' ||
      (traumaFilter === 'TRAUMA' && h.isTraumaCenter) ||
      (traumaFilter === 'NON_TRAUMA' && !h.isTraumaCenter);
    const matchesBeds = bedFilter === 'ALL' ||
      (bedFilter === 'ICU' && (h.capacity?.icuBedsAvailable ?? 0) > 0) ||
      (bedFilter === 'GENERAL' && (h.capacity?.generalBedsAvailable ?? 0) > 0) ||
      (bedFilter === 'VENTILATOR' && (h.capacity?.ventilatorsAvailable ?? 0) > 0);
    return matchesSearch && matchesLevel && matchesTrauma && matchesBeds;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('hospitals')}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{t('hospitalCapacitySubtitle')}</p>

      {/* Hospital Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-wrap gap-4 items-center mt-6 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="label">Search Hospital</label>
          <input
            type="text"
            className="input"
            placeholder="Search by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Emergency Level</label>
          <select className="input" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="">All Tiers</option>
            {uniqueLevels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Trauma Support</label>
          <select className="input" value={traumaFilter} onChange={(e) => setTraumaFilter(e.target.value)}>
            <option value="ALL">All Facilities</option>
            <option value="TRAUMA">Trauma Centers Only</option>
            <option value="NON_TRAUMA">Non-Trauma Only</option>
          </select>
        </div>
        <div>
          <label className="label">Resource Availability</label>
          <select className="input" value={bedFilter} onChange={(e) => setBedFilter(e.target.value)}>
            <option value="ALL">All Hospitals</option>
            <option value="ICU">Available ICU Beds</option>
            <option value="GENERAL">Available General Beds</option>
            <option value="VENTILATOR">Available Ventilators</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-zinc-400">{t('loading')}</p>
      ) : filteredHospitals.length === 0 ? (
        <p className="rounded-lg bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 text-sm text-slate-500 dark:text-zinc-400">
          No hospitals match the selected filters.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredHospitals.map((h) => (
            <div key={h.id} className="card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-zinc-100">{h.name}</h3>
                {h.isTraumaCenter ? <span className="badge bg-red-100 text-critical dark:bg-red-950/40 dark:text-red-400">{t('traumaCenter')}</span> : null}
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{h.address}</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">{t('emergencyLevel')}: {h.emergencyLevel}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <Capacity label={t('icuBeds')} value={h.capacity?.icuBedsAvailable} />
                <Capacity label={t('generalBeds')} value={h.capacity?.generalBedsAvailable} />
                <Capacity label="Ventilators" value={h.capacity?.ventilatorsAvailable} />
              </div>
              <p className="mt-3 text-xs text-slate-400 dark:text-zinc-500">
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
    <div className="rounded-lg bg-slate-50 dark:bg-zinc-950 dark:border dark:border-zinc-800/80 p-2">
      <p className="text-lg font-bold text-slate-900 dark:text-zinc-100">{value ?? 0}</p>
      <p className="text-xs text-slate-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}
