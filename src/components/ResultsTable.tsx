import React, { useState, useMemo } from 'react';
import { 
  XCircle, 
  AlertTriangle, 
  Search, 
  Download, 
  FileJson, 
  Copy, 
  Check, 
  Layers, 
  Activity,
  Info,
  ExternalLink,
  ShieldAlert,
  Server,
  BookOpen,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';
import { lookupTcpService, TcpServiceInfo } from '../data/portServices';

export interface ScanResultItem {
  port: number;
  status: 'OPEN' | 'CLOSED' | 'FILTERED';
  latencyMs: number;
  service?: { name: string; description: string; protocol: string; category?: string };
  error?: string;
}

interface ResultsTableProps {
  currentLang: Language;
  results: ScanResultItem[];
  host: string;
  isScanning: boolean;
  onExportCsv: () => void;
  onExportJson: () => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  currentLang,
  results,
  host,
  isScanning: _isScanning,
  onExportCsv,
  onExportJson,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [filterType, setFilterType] = useState<'all' | 'open' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPort, setCopiedPort] = useState<number | null>(null);

  // Inspector Modal State
  const [inspectItem, setInspectItem] = useState<{
    item: ScanResultItem;
    service: TcpServiceInfo;
  } | null>(null);

  // Standalone Service Lookup Tool State
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [directorySearchPort, setDirectorySearchPort] = useState('');
  const [directoryLookupResult, setDirectoryLookupResult] = useState<TcpServiceInfo | null>(null);

  // Enrich results with lightweight TCP service lookup
  const enrichedResults = useMemo(() => {
    return results.map((item) => {
      const serviceInfo = lookupTcpService(item.port);
      return {
        ...item,
        serviceInfo,
      };
    });
  }, [results]);

  const filteredResults = useMemo(() => {
    return enrichedResults.filter((item) => {
      if (filterType === 'open' && item.status !== 'OPEN') return false;
      if (filterType === 'closed' && item.status === 'OPEN') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const portStr = item.port.toString();
        const serviceName = item.serviceInfo.name.toLowerCase();
        const fullName = item.serviceInfo.fullName.toLowerCase();
        const category = item.serviceInfo.categoryLabel.toLowerCase();
        const desc = item.serviceInfo.description.toLowerCase();
        return (
          portStr.includes(query) ||
          serviceName.includes(query) ||
          fullName.includes(query) ||
          category.includes(query) ||
          desc.includes(query)
        );
      }
      return true;
    });
  }, [enrichedResults, filterType, searchQuery]);

  const openCount = results.filter((r) => r.status === 'OPEN').length;
  const closedCount = results.filter((r) => r.status === 'CLOSED').length;
  const filteredCount = results.filter((r) => r.status === 'FILTERED').length;
  const avgLatency =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length)
      : 0;

  const copyRow = (item: ScanResultItem, service: TcpServiceInfo) => {
    const text = `Port ${item.port} [${service.name}: ${service.fullName}] - ${item.status} (${item.latencyMs}ms) | Target: ${host}`;
    navigator.clipboard.writeText(text);
    setCopiedPort(item.port);
    setTimeout(() => setCopiedPort(null), 1500);
  };

  const handleDirectoryLookup = (portStr: string) => {
    setDirectorySearchPort(portStr);
    const parsed = parseInt(portStr.trim(), 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 65535) {
      setDirectoryLookupResult(lookupTcpService(parsed));
    } else {
      setDirectoryLookupResult(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Metric Cards Row in Professional Slate & Blue */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Ports */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.totalPorts}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-slate-900">
            {results.length}
          </p>
        </div>

        {/* Open Ports */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wider">{t.openPorts}</span>
            <span className="relative flex h-3 w-3">
              {openCount > 0 && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              )}
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-600"></span>
            </span>
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-emerald-700">
            {openCount}
          </p>
        </div>

        {/* Closed Ports */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.closedPorts}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-slate-800">
            {closedCount} {filteredCount > 0 && <span className="text-xs text-amber-600 font-normal">({filteredCount} filtered)</span>}
          </p>
        </div>

        {/* Avg Latency */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.avgLatency}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-slate-900">
            {avgLatency} <span className="text-xs font-medium text-slate-500">ms</span>
          </p>
        </div>
      </div>

      {/* Main Results Table in Professional White & Slate */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.filterAll} ({results.length})
            </button>
            <button
              onClick={() => setFilterType('open')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                filterType === 'open'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              {t.filterOpen} ({openCount})
            </button>
            <button
              onClick={() => setFilterType('closed')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                filterType === 'closed'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-50'
              }`}
            >
              {t.filterClosed} ({closedCount + filteredCount})
            </button>

            {/* Quick Standalone TCP Service Lookup Trigger */}
            <button
              onClick={() => setShowDirectoryModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/90 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-2xs ml-1"
              title="Lookup common TCP service name for any port"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>{t.serviceLookupTitle}</span>
            </button>
          </div>

          {/* Search & Export Buttons */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              onClick={onExportCsv}
              disabled={results.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-40"
              title="Export CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={onExportJson}
              disabled={results.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-40"
              title="Export JSON"
            >
              <FileJson className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center text-sm font-medium text-slate-500">
              {results.length === 0
                ? t.readyToScan
                : filterType === 'open'
                ? t.noOpenPorts
                : t.noResultsFound}
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">{t.portHeader}</th>
                  <th className="py-3 px-4">{t.statusHeader}</th>
                  <th className="py-3 px-4">{t.serviceHeader}</th>
                  <th className="py-3 px-4">{t.latencyHeader}</th>
                  <th className="py-3 px-4 hidden lg:table-cell">{t.actionHeader}</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((item) => {
                  const s = item.serviceInfo;
                  const isOpen = item.status === 'OPEN';
                  const isFiltered = item.status === 'FILTERED';

                  return (
                    <tr
                      key={item.port}
                      className={`transition ${
                        isOpen
                          ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Port Number with IANA Range Tag */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-slate-900">
                            #{item.port}
                          </span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 font-mono">
                            {item.port < 1024 ? 'SYS' : item.port <= 49151 ? 'REG' : 'DYN'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isOpen ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-800 shadow-2xs">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {t.statusOpen}
                          </span>
                        ) : isFiltered ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                            <AlertTriangle className="h-3 w-3 text-amber-600" />
                            {t.statusFiltered}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                            <XCircle className="h-3 w-3 text-rose-500" />
                            {t.statusClosed}
                          </span>
                        )}
                      </td>

                      {/* Common TCP Service Identification (Primary Focus) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {/* Distinctive Service Badge */}
                          <span
                            className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-black uppercase tracking-wide font-mono ${s.badgeColor.bg} ${s.badgeColor.text} ${s.badgeColor.border}`}
                          >
                            {s.name}
                          </span>

                          {/* Full Standard Service Name */}
                          <span className="font-bold text-slate-900 text-xs">
                            {s.fullName}
                          </span>

                          {/* Protocol badge */}
                          <span className="text-[10px] rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                            {s.protocol}
                          </span>
                        </div>

                        {/* Description & Category */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="truncate max-w-sm">{s.description}</span>
                          <span className="inline-block text-slate-300">•</span>
                          <span className="font-semibold text-slate-600">{s.categoryLabel}</span>
                          {s.rfc && (
                            <>
                              <span className="inline-block text-slate-300">•</span>
                              <span className="font-mono text-slate-400">{s.rfc}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Latency */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            item.latencyMs < 50
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.latencyMs < 300
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.latencyMs} ms
                        </span>
                      </td>

                      {/* Security Guidance Note */}
                      <td className="py-3 px-4 hidden lg:table-cell max-w-xs">
                        <div className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                          {s.securityNote}
                        </div>
                      </td>

                      {/* Action Buttons: Inspect & Copy */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Modal Trigger */}
                          <button
                            onClick={() => setInspectItem({ item, service: s })}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition shadow-2xs"
                            title="Inspect Port Details & RFC Guidance"
                          >
                            <Info className="h-3 w-3 text-blue-600" />
                            <span>{t.inspectPort}</span>
                          </button>

                          {/* Quick Copy */}
                          <button
                            onClick={() => copyRow(item, s)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-2xs"
                            title="Copy result string"
                          >
                            {copiedPort === item.port ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-slate-500" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Port & Service Inspector Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-base font-black border ${inspectItem.service.badgeColor.bg} ${inspectItem.service.badgeColor.text} ${inspectItem.service.badgeColor.border}`}
                >
                  {inspectItem.service.name}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      Port {inspectItem.item.port} • {inspectItem.service.fullName}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Target Host: <span className="font-mono font-semibold text-slate-700">{host}</span> • Protocol: <span className="font-semibold text-blue-600">{inspectItem.service.protocol}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-4 text-xs">
              {/* Status & Latency Banner */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600">Scan Status:</span>
                  {inspectItem.item.status === 'OPEN' ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      OPEN
                    </span>
                  ) : inspectItem.item.status === 'FILTERED' ? (
                    <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                      FILTERED / TIMEOUT
                    </span>
                  ) : (
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                      CLOSED (RST)
                    </span>
                  )}
                </div>

                <div className="font-mono text-slate-700">
                  <span className="text-slate-400">Latency:</span> <span className="font-bold text-slate-900">{inspectItem.item.latencyMs} ms</span>
                </div>
              </div>

              {/* Service Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.portRangeLabel}
                  </span>
                  <p className="mt-1 font-semibold text-slate-900">
                    {inspectItem.service.portRange}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.rfcStandardLabel}
                  </span>
                  <p className="mt-1 font-mono font-semibold text-blue-700">
                    {inspectItem.service.rfc || 'Standard IANA Assignment'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Protocol Description
                </span>
                <p className="mt-1 text-slate-700 leading-relaxed">
                  {inspectItem.service.description}
                </p>
              </div>

              {/* Common Software Daemons */}
              {inspectItem.service.commonSoftware.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.commonSoftwareLabel}
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {inspectItem.service.commonSoftware.map((software) => (
                      <span
                        key={software}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-800"
                      >
                        {software}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Recommendations */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <span>{t.securityRecLabel}</span>
                </div>
                <p className="mt-1.5 text-slate-700 leading-relaxed">
                  {inspectItem.service.securityNote}
                </p>
              </div>

              {/* Terminal Verification Command */}
              <div className="rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{t.verificationCmdLabel}</span>
                  <button
                    onClick={() => {
                      const cmd = `nc -zv ${host} ${inspectItem.item.port}`;
                      navigator.clipboard.writeText(cmd);
                    }}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <code className="mt-1 block font-mono text-xs text-emerald-400">
                  nc -zv {host} {inspectItem.item.port}
                </code>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setInspectItem(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone TCP Service Directory Modal */}
      {showDirectoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>{t.serviceLookupTitle}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instant TCP service identifier for any port number (1 - 65535).
                </p>
              </div>
              <button
                onClick={() => setShowDirectoryModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Input for Port */}
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="65535"
                  value={directorySearchPort}
                  onChange={(e) => handleDirectoryLookup(e.target.value)}
                  placeholder="Enter port number (e.g. 80, 22, 443, 3306, 5432)..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Quick Click Chips */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="font-semibold text-slate-500 self-center">Popular:</span>
                {[22, 80, 443, 3306, 3389, 5432, 6379, 8080, 27017].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleDirectoryLookup(p.toString())}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono font-bold text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                  >
                    #{p}
                  </button>
                ))}
              </div>

              {/* Lookup Result Box */}
              {directoryLookupResult ? (
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-black uppercase ${directoryLookupResult.badgeColor.bg} ${directoryLookupResult.badgeColor.text} ${directoryLookupResult.badgeColor.border}`}
                      >
                        {directoryLookupResult.name}
                      </span>
                      <span className="font-black text-slate-900 text-sm">
                        {directoryLookupResult.fullName}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-500">
                      Port {directoryLookupResult.port}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">
                    {directoryLookupResult.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-white p-2 border border-blue-100">
                      <span className="text-[10px] text-slate-400 block font-bold">Category</span>
                      <span className="font-semibold text-slate-800">{directoryLookupResult.categoryLabel}</span>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-blue-100">
                      <span className="text-[10px] text-slate-400 block font-bold">RFC Standard</span>
                      <span className="font-mono text-blue-700 font-semibold">{directoryLookupResult.rfc || 'Standard Port'}</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900">
                    <span className="font-bold block mb-0.5">Security Tip:</span>
                    <span>{directoryLookupResult.securityNote}</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Enter a port number above to inspect its common TCP service name.
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowDirectoryModal(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
