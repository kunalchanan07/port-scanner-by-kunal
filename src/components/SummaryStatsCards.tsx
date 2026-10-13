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
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.totalPorts}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
            <Layers className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">{totalScanned}</p>
          {isScanning && (
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
              scanning...
            </span>
          )}
        </div>
      </div>

      {/* 2. Open Ports Found */}
      <div className={`relative overflow-hidden rounded-2xl border p-4 shadow-xs transition hover:shadow-sm ${
        openCount > 0 
          ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100' 
          : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${
            openCount > 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'
          }`}>
            {t.openPorts}
          </span>
          <div className="flex items-center gap-1.5">
            {openCount > 0 && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
              </span>
            )}
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              openCount > 0 ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
            }`}>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className={`text-2xl font-black font-mono ${
            openCount > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'
          }`}>
            {openCount}
          </p>
          {openCount > 0 && (
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">active</span>
          )}
        </div>
      </div>

      {/* 3. Closed / Filtered Ports */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.closedPorts}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <XCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-black font-mono text-slate-800 dark:text-slate-200">
            {closedCount}
          </p>
          {filteredCount > 0 && (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              +{filteredCount} {t.filteredPorts}
            </span>
          )}
        </div>
      </div>

      {/* 4. Average Latency */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.avgLatency}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {avgLatency}
          </p>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ms</span>
        </div>
      </div>
    </div>
  );
};
