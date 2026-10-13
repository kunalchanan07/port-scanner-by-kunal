import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ScanControls } from './components/ScanControls';
import { SummaryStatsCards } from './components/SummaryStatsCards';
import { ResultsTable, ScanResultItem } from './components/ResultsTable';
import { TerminalView, TerminalLog } from './components/TerminalView';
import { PythonScriptModal } from './components/PythonScriptModal';
import { SecurityNotice } from './components/SecurityNotice';
import { Language, TRANSLATIONS } from './data/translations';
import { Activity, TableProperties, Terminal, Shield } from 'lucide-react';

// Safe API caller that guarantees JSON parsing and prevents HTML <!DOCTYPE error crashes
async function safeApiPost<T = any>(
  url: string,
  body: any
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        ok: false,
        error: `Server returned unexpected response (${res.status}). Please check target host.`,
      };
    }

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error: data.error || `Request failed with HTTP status ${res.status}`,
      };
    }

    return { ok: true, data };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || 'Network request failed or server unreachable',
    };
  }
}

export function App() {
  // English by default as requested
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [host, setHost] = useState('scanme.nmap.org');
  const [portsInput, setPortsInput] = useState('21, 22, 80, 443, 3306, 8080');
  const [timeoutSec, setTimeoutSec] = useState(1.0);
  const [isScanning, setIsScanning] = useState(false);
  const [isDetectingIp, setIsDetectingIp] = useState(false);
  const [resolvedIpInfo, setResolvedIpInfo] = useState<{
    valid: boolean;
    ip?: string;
    version?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Theme Toggle: persists in localStorage and syncs with system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('port_scanner_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('port_scanner_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('port_scanner_theme', 'light');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [isDarkMode]);

  const [results, setResults] = useState<ScanResultItem[]>([]);
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'both' | 'table' | 'terminal'>('both');

  const sseRef = useRef<EventSource | null>(null);
  const isScanFinishedRef = useRef(false);
  const resultsCountRef = useRef(0);
  const t = TRANSLATIONS[currentLang];

  // Helper to append a line to the live terminal
  const addLog = (
    text: string,
    type: 'info' | 'open' | 'closed' | 'filtered' | 'error' | 'header' = 'info',
    showTimestamp = true
  ) => {
    const timeStr = showTimestamp
      ? new Date().toLocaleTimeString('en-US', { hour12: false })
      : '';
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeStr,
        type,
        text,
      },
    ]);
  };

  // Detect Client IP
  const handleDetectMyIp = async () => {
    setIsDetectingIp(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/my-ip');
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.ip) {
          setHost(data.ip);
          addLog(
            currentLang === 'pa'
              ? `ਕਲਾਇੰਟ IP ਪਤਾ ਲੱਗਾ: ${data.ip}`
              : `Client IP detected: ${data.ip}`,
            'info'
          );
          return;
        }
      }
      setHost('127.0.0.1');
    } catch {
      setHost('127.0.0.1');
      addLog(
        currentLang === 'pa'
          ? 'IP ਨਹੀਂ ਮਿਲ ਸਕਿਆ, 127.0.0.1 ਲਾਗੂ ਕੀਤਾ ਗਿਆ'
          : 'Could not detect remote IP. Fallback to 127.0.0.1',
        'info'
      );
    } finally {
      setIsDetectingIp(false);
    }
  };

  // Start Scanning Execution
  const handleStartScan = async () => {
    if (!host.trim()) {
      setErrorMessage(t.invalidHost);
      return;
    }

    setErrorMessage(null);
    setIsScanning(true);
    isScanFinishedRef.current = false;
    resultsCountRef.current = 0;

    const rawPorts = portsInput
      .split(',')
      .map((p) => parseInt(p.trim(), 10))
      .filter((p) => !isNaN(p) && p >= 1 && p <= 65535);

    const cleanPorts = Array.from(new Set(rawPorts)).slice(0, 100);

    if (cleanPorts.length === 0) {
      setErrorMessage(t.invalidHost);
      setIsScanning(false);
      return;
    }

    setResults([]);
    addLog('========================================', 'header', false);
    addLog(
      `===== ${currentLang === 'pa' ? 'ਪੋਰਟ ਸਕੈਨਰ ਬਾਈ ਕੁਨਾਲ' : 'PORT SCANNER BY KUNAL'} =====`,
      'header',
      false
    );
    addLog(
      currentLang === 'pa'
        ? `ਟਾਰਗਿਟ IP: ${host}`
        : `Target Host/IP: ${host}`,
      'info'
    );
    addLog(
      currentLang === 'pa'
        ? `ਚੁਣੇ ਗਏ ਪੋਰਟ: ${cleanPorts.join(', ')}`
        : `Target Ports (${cleanPorts.length}): ${cleanPorts.join(', ')}`,
      'info'
    );
    addLog(
      currentLang === 'pa'
        ? `ਟਾਈਮਆਊਟ: ${timeoutSec}s`
        : `Socket Timeout: ${timeoutSec}s`,
      'info'
    );

    let targetToScan = host.trim();

    // Resolve DNS / Validate IP (supports URLs like https://google.com, http://..., google.com)
    try {
      const resolveResult = await safeApiPost('/api/resolve-target', { target: host });
      if (resolveResult.ok && resolveResult.data?.valid) {
        const resolveData = resolveResult.data;
        setResolvedIpInfo(resolveData);
        targetToScan = resolveData.host || targetToScan;
        addLog(
          currentLang === 'pa'
            ? `ਟਾਰਗਿਟ ਹੱਲ: ${resolveData.host} -> ${resolveData.ip} (${resolveData.version})`
            : `Target resolved: ${resolveData.host} -> ${resolveData.ip} (${resolveData.version})`,
          'info'
        );
        // If a port was detected in the URL (e.g. http://localhost:3000), auto-include it
        if (resolveData.detectedPort && !cleanPorts.includes(resolveData.detectedPort)) {
          cleanPorts.push(resolveData.detectedPort);
          addLog(
            `[Auto-detect] Added port ${resolveData.detectedPort} from URL`,
            'info'
          );
        }
      } else {
        const errMsg = resolveResult.error || t.invalidHost;
        setErrorMessage(errMsg);
        addLog(`[Error] ${errMsg}`, 'error');
        setIsScanning(false);
        return;
      }
    } catch {
      addLog(
        currentLang === 'pa'
          ? `[DNS] ${host} ਨਾਲ ਸਕੈਨਿੰਗ ਜਾਰੀ`
          : `[DNS] Continuing scan on ${host}`,
        'info'
      );
    }

    addLog(
      currentLang === 'pa'
        ? `\nਸਕੈਨਿੰਗ ਸ਼ੁਰੂ ਹੋ ਰਹੀ ਹੈ: ${targetToScan}...\n`
        : `\nScanning target: ${targetToScan}...\n`,
      'info',
      false
    );

    const timeoutMs = Math.round(timeoutSec * 1000);
    const sseUrl = `/api/scan-stream?host=${encodeURIComponent(
      targetToScan
    )}&ports=${encodeURIComponent(cleanPorts.join(','))}&timeout=${timeoutMs}`;

    if (sseRef.current) {
      sseRef.current.close();
    }

    const eventSource = new EventSource(sseUrl);
    sseRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'result' && data.result) {
          const resItem: ScanResultItem = data.result;
          resultsCountRef.current += 1;
          setResults((prev) => [...prev, resItem]);

          if (resItem.status === 'OPEN') {
            addLog(
              `[OPEN] Port ${resItem.port} (${resItem.service?.name || 'TCP'}) - ${resItem.latencyMs}ms`,
              'open'
            );
          } else if (resItem.status === 'FILTERED') {
            addLog(
              `[CLOSED/FILTERED] Port ${resItem.port} (Timeout/Filtered)`,
              'filtered'
            );
          } else {
            addLog(
              `[CLOSED] Port ${resItem.port} (${resItem.service?.name || 'TCP'})`,
              'closed'
            );
          }
        } else if (data.type === 'complete') {
          isScanFinishedRef.current = true;
          addLog(
            `\n===== ${currentLang === 'pa' ? 'ਸਕੈਨ ਮੁਕੰਮਲ ਹੋ ਗਿਆ' : 'SCAN COMPLETE'} =====`,
            'header',
            false
          );
          eventSource.close();
          sseRef.current = null;
          setIsScanning(false);
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.onerror = async () => {
      eventSource.close();
      sseRef.current = null;

      // If scan already completed or we already collected ports via SSE, exit cleanly
      if (isScanFinishedRef.current || resultsCountRef.current > 0) {
        setIsScanning(false);
        return;
      }

      // If SSE stream failed upfront (e.g., browser proxy/CORS buffer drop), smoothly fallback to batch socket scan
      addLog(
        currentLang === 'pa'
          ? 'ਬੈਚ ਮੋਡ ਵਿੱਚ ਸਾਕਟ ਸਕੈਨਿੰਗ ਹੋ ਰਹੀ ਹੈ...'
          : 'Connecting via socket batch scan...',
        'info'
      );

      const batchResult = await safeApiPost('/api/scan', {
        host: targetToScan,
        ports: cleanPorts,
        timeout: timeoutMs,
      });

      if (batchResult.ok && batchResult.data?.results) {
        const batchData = batchResult.data;
        setResults(batchData.results);
        batchData.results.forEach((r: ScanResultItem) => {
          if (r.status === 'OPEN') {
            addLog(
              `[OPEN] Port ${r.port} (${r.service?.name || 'TCP'}) - ${r.latencyMs}ms`,
              'open'
            );
          } else {
            addLog(`[CLOSED/FILTERED] Port ${r.port}`, 'closed');
          }
        });
        addLog(
          `\n===== ${currentLang === 'pa' ? 'ਸਕੈਨ ਮੁਕੰਮਲ' : 'SCAN COMPLETE'} =====`,
          'header',
          false
        );
      } else {
        addLog(
          currentLang === 'pa'
            ? `ਸਕੈਨ ਅਸਫਲ: ${batchResult.error || 'ਕਨੈਕਸ਼ਨ ਅਸਮਰੱਥ'}`
            : `Scan failed: ${batchResult.error || 'Connection failed'}`,
          'error'
        );
      }
      setIsScanning(false);
    };
  };

  // Stop current scan
  const handleStopScan = () => {
    isScanFinishedRef.current = true;
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    setIsScanning(false);
    addLog(
      currentLang === 'pa'
        ? '[ਸਕੈਨ ਯੂਜ਼ਰ ਵੱਲੋਂ ਰੋਕਿਆ ਗਿਆ]'
        : '[Scan stopped by user]',
      'error'
    );
  };

  // Clear results and logs
  const handleClear = () => {
    isScanFinishedRef.current = true;
    resultsCountRef.current = 0;
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    setIsScanning(false);
    setResults([]);
    setLogs([]);
    setErrorMessage(null);
    setResolvedIpInfo(null);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (results.length === 0) return;
    const header = 'Port,Status,Service,Protocol,Latency(ms),Description\n';
    const rows = results
      .map(
        (r) =>
          `"${r.port}","${r.status}","${r.service?.name || ''}","${
            r.service?.protocol || 'TCP'
          }","${r.latencyMs}","${r.service?.description || ''}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `port_scan_${host}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJson = () => {
    if (results.length === 0) return;
    const payload = {
      target: host,
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        open: results.filter((r) => r.status === 'OPEN').length,
        closed: results.filter((r) => r.status === 'CLOSED').length,
        filtered: results.filter((r) => r.status === 'FILTERED').length,
      },
      results,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `port_scan_${host}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        onSelectTarget={(t) => setHost(t)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Security Notice */}
        <SecurityNotice currentLang={currentLang} />

        {/* Scan Controls Input Card */}
        <ScanControls
          currentLang={currentLang}
          host={host}
          setHost={setHost}
          portsInput={portsInput}
          setPortsInput={setPortsInput}
          timeoutSec={timeoutSec}
          setTimeoutSec={setTimeoutSec}
          isScanning={isScanning}
          onStartScan={handleStartScan}
          onStopScan={handleStopScan}
          onClear={handleClear}
          onDetectMyIp={handleDetectMyIp}
          isDetectingIp={isDetectingIp}
          resolvedIpInfo={resolvedIpInfo}
          errorMessage={errorMessage}
        />

        {/* Summary Stats Cards Component (Instant Scan Overview) */}
        <SummaryStatsCards
          currentLang={currentLang}
          results={results}
          isScanning={isScanning}
        />

        {/* View Layout Switcher */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {t.resultsView}
            </h2>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 text-xs shadow-2xs">
            <button
              onClick={() => setActiveTab('both')}
              className={`rounded-lg px-3 py-1 font-bold transition ${
                activeTab === 'both'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400'
              }`}
            >
              {t.splitView}
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`rounded-lg px-3 py-1 font-bold transition ${
                activeTab === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400'
              }`}
            >
              <TableProperties className="inline h-3.5 w-3.5 mr-1" />
              {t.tableView}
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`rounded-lg px-3 py-1 font-bold transition ${
                activeTab === 'terminal'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400'
              }`}
            >
              <Terminal className="inline h-3.5 w-3.5 mr-1" />
              {t.consoleView}
            </button>
          </div>
        </div>

        {/* Dual Dashboard: Results Table & Live Terminal */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Table View */}
          <div
            className={`${
              activeTab === 'terminal'
                ? 'hidden'
                : activeTab === 'table'
                ? 'lg:col-span-12'
                : 'lg:col-span-7'
            }`}
          >
            <ResultsTable
              currentLang={currentLang}
              results={results}
              host={host}
              isScanning={isScanning}
              onExportCsv={handleExportCsv}
              onExportJson={handleExportJson}
            />
          </div>

          {/* Terminal Console View */}
          <div
            className={`${
              activeTab === 'table'
                ? 'hidden'
                : activeTab === 'terminal'
                ? 'lg:col-span-12'
                : 'lg:col-span-5'
            }`}
          >
            <TerminalView
              currentLang={currentLang}
              logs={logs}
              onClearLogs={() => setLogs([])}
              isScanning={isScanning}
            />
          </div>
        </div>
      </main>

      {/* Python Script Modal */}
      <PythonScriptModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        currentLang={currentLang}
      />

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500 dark:text-slate-400 mt-8 shadow-xs transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            {t.footerTagline}
          </p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 dark:text-slate-400 font-semibold">
            <span>socket.SOCK_STREAM</span>
            <span>•</span>
            <span>s.connect_ex</span>
            <span>•</span>
            <span>TCP RFC 793</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
