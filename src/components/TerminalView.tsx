import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Copy, Check, Trash2, ArrowDownCircle } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'info' | 'open' | 'closed' | 'filtered' | 'error' | 'header';
  text: string;
}

interface TerminalViewProps {
  currentLang: Language;
  logs: TerminalLog[];
  onClearLogs: () => void;
  isScanning: boolean;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  currentLang,
  logs,
  onClearLogs,
  isScanning,
}) => {
  const t = TRANSLATIONS[currentLang];
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `${l.timestamp ? `[${l.timestamp}] ` : ''}${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-blue-200 bg-blue-950 shadow-xl overflow-hidden font-mono">
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-blue-900 bg-blue-900/90 px-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500"></div>
            <div className="h-3 w-3 rounded-full bg-amber-400"></div>
            <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
          </div>
          <div className="ml-2 flex items-center gap-1.5 text-blue-100 font-sans font-bold">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>{t.terminalOutput}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isScanning && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-sans font-bold animate-pulse mr-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>{t.scanning}</span>
            </div>
          )}

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`rounded-lg px-2 py-1 text-[11px] transition ${
              autoScroll
                ? 'bg-blue-800 text-cyan-300 font-bold border border-blue-700'
                : 'text-blue-300 hover:text-white'
            }`}
            title="Toggle Auto-scroll"
          >
            <ArrowDownCircle className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1 rounded-lg bg-blue-800 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition disabled:opacity-40"
            title="Copy Terminal Logs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? t.copied : t.copyHeader}</span>
          </button>

          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="rounded-lg bg-blue-800 p-1 text-blue-300 hover:bg-rose-900 hover:text-rose-200 transition disabled:opacity-40"
            title="Clear Terminal Output"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 overflow-y-auto p-4 text-xs space-y-1.5 select-text bg-gradient-to-b from-blue-950 via-slate-950 to-blue-950 min-h-[300px] max-h-[480px]">
        {logs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-blue-300/60 py-16">
            <Terminal className="h-10 w-10 text-blue-400/50 mb-3" />
            <p className="font-sans text-sm font-semibold text-blue-100">
              {t.readyToScan}
            </p>
            <p className="font-mono text-[11px] text-blue-400/80 mt-1">
              $ python port_scanner.py
            </p>
          </div>
        ) : (
          logs.map((log) => {
            let colorClass = 'text-blue-100';
            if (log.type === 'header') colorClass = 'text-cyan-300 font-bold';
            if (log.type === 'open') colorClass = 'text-emerald-300 font-bold';
            if (log.type === 'closed') colorClass = 'text-rose-300/90';
            if (log.type === 'filtered') colorClass = 'text-amber-300/90';
            if (log.type === 'error') colorClass = 'text-rose-400 font-bold';
            if (log.type === 'info') colorClass = 'text-blue-200';

            return (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                {log.timestamp && (
                  <span className="text-[10px] text-blue-400/60 shrink-0 select-none">
                    {log.timestamp}
                  </span>
                )}
                <span className={`${colorClass} break-all`}>
                  {log.text}
                </span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
