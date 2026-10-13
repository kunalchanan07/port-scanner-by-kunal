import React, { useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ScanControls } from './components/ScanControls';
import { ResultsTable, ScanResultItem } from './components/ResultsTable';
import { TerminalView, TerminalLog } from './components/TerminalView';
import { PythonScriptModal } from './components/PythonScriptModal';
import { SecurityNotice } from './components/SecurityNotice';
import { Language, TRANSLATIONS } from './data/translations';
import { Activity, TableProperties, Terminal, Shield } from 'lucide-react';

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

  const [results, setResults] = useState<ScanResultItem[]>([]);
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'both' | 'table' | 'terminal'>('both');

  const sseRef = useRef<EventSource | null>(null);
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
      const data = await res.json();
      if (data.ip) {
        setHost(data.ip);
        addLog(
          currentLang === 'pa'
            ? `ਕਲਾਇੰਟ IP ਪਤਾ ਲੱਗਾ: ${data.ip}`
            : `Client IP detected: ${data.ip}`,
          'info'
        );
      }
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

    // Resolve DNS / Validate IP
    try {
      const resolveRes = await fetch('/api/resolve-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: host }),
      });
      const resolveData = await resolveRes.json();
      if (resolveData.valid) {
        setResolvedIpInfo(resolveData);
        addLog(
          currentLang === 'pa'
            ? `IP ਹੱਲ ਕੀਤਾ ਗਿਆ: ${resolveData.ip} (${resolveData.version})`
            : `DNS resolved target to: ${resolveData.ip} (${resolveData.version})`,
          'info'
        );
      } else {
        setErrorMessage(resolveData.error || t.invalidHost);
        addLog(`[Error] ${resolveData.error || 'Failed to resolve host'}`, 'error');
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
        ? `\nਸਕੈਨਿੰਗ ਸ਼ੁਰੂ ਹੋ ਰਹੀ ਹੈ ${host}...\n`
        : `\nScanning ${host}...\n`,
      'info',
      false
    );

    const timeoutMs = Math.round(timeoutSec * 1000);
    const sseUrl = `/api/scan-stream?host=${encodeURIComponent(
      host
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
          addLog(
            `\n===== ${currentLang === 'pa' ? 'ਸਕੈਨ ਮੁਕੰਮਲ ਹੋ ਗਿਆ' : 'SCAN COMPLETE'} =====`,
            'header',
            false
          );
          eventSource.close();
          setIsScanning(false);
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.onerror = async () => {
      eventSource.close();
      if (results.length === 0) {
        addLog(
          currentLang === 'pa'
            ? 'ਬੈਚ ਮੋਡ ਵਿੱਚ ਸਕੈਨਿੰਗ ਹੋ ਰਹੀ ਹੈ...'
            : 'Falling back to batch socket scan...',
          'info'
        );
        try {
          const scanRes = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              host,
              ports: cleanPorts,
              timeout: timeoutMs,
            }),
          });
          const batchData = await scanRes.json();
          if (batchData.results) {
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
          }
        } catch (e: any) {
          addLog(
            currentLang === 'pa'
              ? `ਸਕੈਨ ਅਸਫਲ: ${e.message}`
              : `Scan failed: ${e.message}`,
            'error'
          );
        }
      }
      setIsScanning(false);
    };
  };

  // Stop current scan
  const handleStopScan = () => {
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
      {/* Top Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        onSelectTarget={(t) => setHost(t)}
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

        {/* View Layout Switcher */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {t.resultsView}
            </h2>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-2xs">
            <button
              onClick={() => setActiveTab('both')}
              className={`rounded-lg px-3 py-1 font-bold transition ${
                activeTab === 'both'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              {t.splitView}
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`rounded-lg px-3 py-1 font-bold transition ${
                activeTab === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-blue-700'
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
                  : 'text-slate-600 hover:text-blue-700'
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
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 mt-8 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-900">
            {t.footerTagline}
          </p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 font-semibold">
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
