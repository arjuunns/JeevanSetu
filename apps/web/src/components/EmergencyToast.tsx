'use client';

import React from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface EmergencyAlertData {
  id: string;
  department: string;
  title: string;
  body: string;
  visitId?: string;
  timestamp: string;
}

interface EmergencyToastProps {
  alert: EmergencyAlertData;
  onDismiss: () => void;
}

export function EmergencyToast({ alert, onDismiss }: EmergencyToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full rounded-lg bg-white border border-red-200 shadow-xl overflow-hidden animate-slide-in">
      <div className="bg-red-600 px-4 py-2.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 animate-pulse" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em]">Critical Emergency Broadcast</span>
        </div>
        <button onClick={onDismiss} className="text-red-200 hover:text-white transition">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <h4 className="font-semibold tracking-tight text-neutral-900 text-sm dark:text-zinc-100">{alert.title}</h4>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400">Dept: <span className="font-semibold text-red-600">{alert.department}</span></p>
        <p className="text-neutral-600 dark:text-zinc-400 text-xs mt-2 leading-relaxed border-l-2 border-red-200 pl-3 py-1 dark:border-red-900">
          {alert.body}
        </p>
        {alert.visitId && (
          <div className="mt-3 flex justify-end">
            <Link
              href="/review"
              onClick={onDismiss}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition"
            >
              <span>Go to Review Queue</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
