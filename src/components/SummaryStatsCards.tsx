import React from 'react';
import { Layers, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';
import { ScanResultItem } from './ResultsTable';

interface SummaryStatsCardsProps {
  currentLang: Language;
  results: ScanResultItem[];
  isScanning: boolean;
}

export const SummaryStatsCards: React.FC<SummaryStatsCardsProps> = ({
  currentLang,
  results,
  isScanning,
}) => {
  const t = TRANSLATIONS[currentLang];

  const totalScanned = results.length;
  const openCount = results.filter((r) => r.status === 'OPEN').length;
  const closedCount = results.filter((r) => r.status === 'CLOSED').length;
  const filteredCount = results.filter((r) => r.status === 'FILTERED').length;
  const avgLatency =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length)
      : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {/* 1. Total Ports Scanned */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:border-blue-300 hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t.totalPorts}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Layers className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-black font-mono text-slate-900">{totalScanned}</p>
          {isScanning && (
            <span className="text-xs font-semibold text-blue-600 animate-pulse">
              scanning...
            </span>
          )}
        </div>
      </div>

      {/* 2. Open Ports Found */}
      <div className={`relative overflow-hidden rounded-2xl border p-4 shadow-xs transition hover:shadow-sm ${
        openCount > 0 
          ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950' 
          : 'border-slate-200/90 bg-white'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            openCount > 0 ? 'text-emerald-800' : 'text-slate-500'
          }`}>
            {t.openPorts}
          </span>
          <div className="flex items-center gap-1.5">
            {openCount > 0 && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
              </span>
            )}
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              openCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
            }`}>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className={`text-2xl font-black font-mono ${
            openCount > 0 ? 'text-emerald-700' : 'text-slate-900'
          }`}>
            {openCount}
          </p>
          {openCount > 0 && (
            <span className="text-[11px] font-bold text-emerald-700">active</span>
          )}
        </div>
      </div>

      {/* 3. Closed / Filtered Ports */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t.closedPorts}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <XCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-black font-mono text-slate-800">
            {closedCount}
          </p>
          {filteredCount > 0 && (
            <span className="text-[11px] font-medium text-amber-600">
              +{filteredCount} {t.filteredPorts}
            </span>
          )}
        </div>
      </div>

      {/* 4. Average Latency */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:border-indigo-300 hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {t.avgLatency}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <p className="text-2xl font-black font-mono text-slate-900">
            {avgLatency}
          </p>
          <span className="text-xs font-semibold text-slate-500">ms</span>
        </div>
      </div>
    </div>
  );
};
