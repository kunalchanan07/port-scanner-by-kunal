import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Clock, 
  Compass, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  History,
  X,
  Trash2,
  Globe
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';
import { PRESET_BUNDLES } from '../data/portServices';

const STORAGE_KEY = 'port_scanner_recent_targets';
const DEFAULT_RECENT = ['google.com', 'scanme.nmap.org', '127.0.0.1', '1.1.1.1', '8.8.8.8'];

interface ScanControlsProps {
  currentLang: Language;
  host: string;
  setHost: (host: string) => void;
  portsInput: string;
  setPortsInput: (val: string) => void;
  timeoutSec: number;
  setTimeoutSec: (val: number) => void;
  isScanning: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
  onClear: () => void;
  onDetectMyIp: () => void;
  isDetectingIp: boolean;
  resolvedIpInfo: { valid: boolean; ip?: string; version?: string } | null;
  errorMessage: string | null;
}

export const ScanControls: React.FC<ScanControlsProps> = ({
  currentLang,
  host,
  setHost,
  portsInput,
  setPortsInput,
  timeoutSec,
  setTimeoutSec,
  isScanning,
  onStartScan,
  onStopScan,
  onClear,
  onDetectMyIp,
  isDetectingIp,
  resolvedIpInfo,
  errorMessage,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [rangeStart, setRangeStart] = useState('20');
  const [rangeEnd, setRangeEnd] = useState('100');

  // Recent Targets persisted with localStorage (last 5 scanned)
  const [recentTargets, setRecentTargets] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5);
        }
      }
      return DEFAULT_RECENT.slice(0, 5);
    } catch {
      return DEFAULT_RECENT.slice(0, 5);
    }
  });

  // Save to localStorage when recentTargets changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentTargets));
    } catch (e) {
      console.warn('Could not save recent targets:', e);
    }
  }, [recentTargets]);

  const addRecentTarget = (targetToSave: string) => {
    const clean = targetToSave.trim();
    if (!clean) return;
    setRecentTargets((prev) => {
      // Remove any existing match to avoid duplicates, then add to top
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 5);
      return updated;
    });
  };

  const removeRecentTarget = (e: React.MouseEvent, targetToRemove: string) => {
    e.stopPropagation();
    setRecentTargets((prev) => prev.filter((item) => item !== targetToRemove));
  };

  const clearAllRecent = () => {
    setRecentTargets([]);
  };

  const applyPreset = (presetPorts: number[]) => {
    setPortsInput(presetPorts.join(', '));
  };

  const handleApplyRange = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseInt(rangeStart, 10);
    const end = parseInt(rangeEnd, 10);
    if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= 65535 && start <= end) {
      const ports: number[] = [];
      const count = Math.min(end - start + 1, 100);
      for (let i = 0; i < count; i++) {
        ports.push(start + i);
      }
      setPortsInput(ports.join(', '));
      setShowRangeModal(false);
    }
  };

  const handleScanTrigger = () => {
    if (host.trim()) {
      addRecentTarget(host);
    }
    onStartScan();
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-7 space-y-5">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Target IP (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
              <Server className="h-4 w-4 text-blue-600" />
              <span>{t.targetHostLabel}</span>
            </label>
            <button
              type="button"
              onClick={onDetectMyIp}
              disabled={isScanning || isDetectingIp}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition underline underline-offset-4 disabled:opacity-50"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{isDetectingIp ? t.resolving : t.detectMyIp}</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder={t.targetHostPlaceholder}
              disabled={isScanning}
              className="w-full rounded-xl border border-blue-200 bg-blue-50/30 px-4 py-3 font-mono text-sm font-medium text-blue-950 placeholder-slate-400 shadow-inner outline-none transition focus:border-blue-600 focus:bg-white focus:ring-3 focus:ring-blue-500/20 disabled:opacity-60"
            />
          </div>

          {/* Browser / URL Compatibility Hint */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 leading-tight">
            <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span>{t.browserUrlHint}</span>
          </div>

          {/* DNS Resolution Info Badge */}
          {resolvedIpInfo && resolvedIpInfo.valid && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 font-mono">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                {t.resolvedTo} <strong className="text-emerald-950">{resolvedIpInfo.ip}</strong> ({resolvedIpInfo.version})
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Middle Column: Port Numbers Input (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-950">
              <Hash className="h-4 w-4 text-blue-600" />
              <span>{t.portsLabel}</span>
            </label>
            <span className="text-[11px] font-medium text-slate-500">
              {t.maxPortsNotice}
            </span>
          </div>

          <input
            type="text"
            value={portsInput}
            onChange={(e) => setPortsInput(e.target.value)}
            placeholder={t.portsPlaceholder}
            disabled={isScanning}
            className="w-full rounded-xl border border-blue-200 bg-blue-50/30 px-4 py-3 font-mono text-sm font-medium text-blue-950 placeholder-slate-400 shadow-inner outline-none transition focus:border-blue-600 focus:bg-white focus:ring-3 focus:ring-blue-500/20 disabled:opacity-60"
          />

          {/* Quick Presets in Blue & White */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-500">{t.quickPresets}:</span>
            {PRESET_BUNDLES.map((preset) => {
              const label =
                currentLang === 'pa'
                  ? preset.namePa
                  : currentLang === 'hi'
                  ? preset.nameHi
                  : preset.name;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.ports)}
                  disabled={isScanning}
                  className="rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-[11px] font-semibold text-blue-800 hover:border-blue-500 hover:bg-blue-600 hover:text-white transition shadow-2xs disabled:opacity-50"
                  title={preset.description}
                >
                  {label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowRangeModal(!showRangeModal)}
              disabled={isScanning}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white transition disabled:opacity-50"
            >
              {t.presetCustomRange}
            </button>
          </div>

          {/* Custom Range Popover */}
          {showRangeModal && (
            <form onSubmit={handleApplyRange} className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 p-2 text-xs text-blue-950">
              <span className="font-semibold">Start:</span>
              <input
                type="number"
                min="1"
                max="65535"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className="w-16 rounded-lg border border-blue-200 bg-white px-2 py-1 text-center font-mono text-blue-950"
              />
              <span className="font-semibold">End:</span>
              <input
                type="number"
                min="1"
                max="65535"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className="w-16 rounded-lg border border-blue-200 bg-white px-2 py-1 text-center font-mono text-blue-950"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-1 font-bold text-white hover:bg-blue-700 transition"
              >
                {t.applyRange}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Timeout & Action Buttons (2 cols) */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-3.5">
          <div className="space-y-1.5 rounded-xl border border-blue-100 bg-blue-50/40 p-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>{t.timeoutLabel}</span>
              </label>
              <span className="font-mono text-xs font-bold text-blue-700">
                {timeoutSec}s
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.1"
              value={timeoutSec}
              onChange={(e) => setTimeoutSec(parseFloat(e.target.value))}
              disabled={isScanning}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-blue-200 accent-blue-600 disabled:opacity-50"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>0.3s ({t.timeoutFast})</span>
              <span>1.0s</span>
              <span>3.0s</span>
            </div>
          </div>

          <div className="space-y-2">
            {!isScanning ? (
              <button
                type="button"
                onClick={handleScanTrigger}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-current transition group-hover:scale-110" />
                <span>{t.startScan}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStopScan}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 font-bold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-700 active:scale-[0.98]"
              >
                <Square className="h-4 w-4 fill-current animate-pulse" />
                <span>{t.stopScan}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClear}
              disabled={isScanning}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t.clearResults}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Targets Section (Persisted in localStorage, max 5 items) */}
      <div className="border-t border-blue-100 pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs text-blue-950 font-bold">
          <History className="h-3.5 w-3.5 text-blue-600" />
          <span>{t.recentTargets}</span>
          <span className="text-[10px] font-mono text-slate-400">({recentTargets.length}/5)</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 flex-1 sm:justify-end">
          {recentTargets.length === 0 ? (
            <span className="text-xs text-slate-400 italic">
              {t.noRecentTargets}
            </span>
          ) : (
            <>
              {recentTargets.map((item) => {
                const isSelected = host.trim().toLowerCase() === item.toLowerCase();
                return (
                  <div
                    key={item}
                    onClick={() => !isScanning && setHost(item)}
                    className={`group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono transition cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'bg-blue-50/80 border border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-400'
                    } ${isScanning ? 'opacity-60 cursor-not-allowed' : ''}`}
                    title={`Click to set target: ${item}`}
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={(e) => removeRecentTarget(e, item)}
                      className={`rounded-full p-0.5 transition ${
                        isSelected
                          ? 'text-blue-200 hover:bg-blue-700 hover:text-white'
                          : 'text-slate-400 hover:bg-blue-200 hover:text-rose-600'
                      }`}
                      title="Remove from recent"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={clearAllRecent}
                disabled={isScanning}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-600 ml-1 px-1.5 py-0.5 transition"
                title="Clear all recent targets"
              >
                <Trash2 className="h-3 w-3" />
                <span className="hidden sm:inline">{t.clearRecent}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
