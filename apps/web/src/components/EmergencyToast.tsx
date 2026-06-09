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
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full rounded-xl bg-white border border-red-200 shadow-2xl overflow-hidden animate-slide-in">
      <div className="bg-red-600 px-4 py-2.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-wider">Critical Emergency Broadcast</span>
        </div>
        <button onClick={onDismiss} className="text-red-200 hover:text-white transition">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-slate-800 text-sm">{alert.title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">Dept: <span className="font-semibold text-red-600">{alert.department}</span></p>
        <p className="text-slate-600 text-xs mt-2 leading-relaxed bg-red-50/50 p-2 rounded-lg border border-red-50/80">
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
