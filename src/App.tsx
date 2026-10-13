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

// Client-side intelligent host sanitizer: works across Chrome, Safari, Google URLs, etc.
function cleanClientTarget(input: string): { cleanHost: string; detectedPort?: number } {
  let val = (input || '').trim();
  if (!val) return { cleanHost: 'google.com' };

  // Common keywords
  const lower = val.toLowerCase();
  if (lower === 'google' || lower === 'chrome' || lower === 'safari') {
    return { cleanHost: 'google.com' };
  }

  // Handle browser protocol prefixes (https://, http://, ftp://, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(val)) {
    try {
      const parsed = new URL(val);
      const hostPart = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
      const detectedPort = parsed.port ? parseInt(parsed.port, 10) : undefined;
      return { cleanHost: hostPart || 'google.com', detectedPort };
    } catch {
      val = val.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
    }
  }

  // Strip leading //
  val = val.replace(/^\/\//, '');
  // Strip paths
  val = val.split('/')[0];
  // Strip queries and hash
  val = val.split('?')[0].split('#')[0].trim();

  // Host:port notation
  let detectedPort: number | undefined;
  if (/^[^:]+:\d+$/.test(val)) {
    const parts = val.split(':');
    val = parts[0];
    const p = parseInt(parts[1], 10);
    if (!isNaN(p) && p >= 1 && p <= 65535) {
      detectedPort = p;
    }
  }

  val = val.replace(/^\[|\]$/g, '').trim().toLowerCase();
  if (!val) val = 'google.com';

  if (!val.includes('.') && val !== 'localhost') {
    val = `${val}.com`;
  }

  return { cleanHost: val, detectedPort };
}

// Production Render Python backend URL
export const DEFAULT_RENDER_BACKEND_URL = 'https://port-scanner-by-kunal.onrender.com';

// Single Backend API URL variable (VITE_API_BASE_URL)
// Reads import.meta.env.VITE_API_BASE_URL if configured in Netlify,
// and falls back directly to the deployed Render backend so scans always succeed even if the build environment variable was omitted or cached.
const rawEnvUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
export const BACKEND_URL = (
  rawEnvUrl && rawEnvUrl.length > 0
    ? rawEnvUrl
    : DEFAULT_RENDER_BACKEND_URL
).replace(/\/+$/, '');

export function getApiEndpoint(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return BACKEND_URL ? `${BACKEND_URL}${normalizedPath}` : normalizedPath;
}

// Client-side Target IP / Hostname Validation
export function validateTarget(inputHost: string): { valid: boolean; error?: string; cleanTarget: string } {
  const raw = (inputHost || '').trim();
  if (!raw) {
    return { valid: false, error: 'Please enter a target host or IP address.', cleanTarget: '' };
  }

  const { cleanHost } = cleanClientTarget(raw);
  const lower = cleanHost.toLowerCase();

  // Localhost / Loopback is always valid
  if (lower === 'localhost' || lower === '127.0.0.1' || lower === '::1') {
    return { valid: true, cleanTarget: lower };
  }

  // IPv4 Address Validation
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipMatch = lower.match(ipv4Regex);
  if (ipMatch) {
    const octets = [
      parseInt(ipMatch[1], 10),
      parseInt(ipMatch[2], 10),
      parseInt(ipMatch[3], 10),
      parseInt(ipMatch[4], 10),
    ];

    for (const oct of octets) {
      if (oct < 0 || oct > 255) {
        return {
          valid: false,
          error: `Invalid IPv4 address '${cleanHost}': Octet values must be between 0 and 255.`,
          cleanTarget: cleanHost,
        };
      }
    }

    // Check private subnets (RFC 1918)
    const [first, second] = octets;
    const isPrivate =
      first === 10 ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 169 && second === 254);

    if (isPrivate) {
      return {
        valid: false,
        error: `Scanning internal private IP (${cleanHost}) is restricted to prevent unauthorized network intrusion. Please scan localhost (127.0.0.1), scanme.nmap.org, or a public IP.`,
        cleanTarget: cleanHost,
      };
    }

    return { valid: true, cleanTarget: cleanHost };
  }

  // IPv6 Validation
  if (lower.includes(':')) {
    if (!/^[0-9a-fA-F:]+$/.test(lower)) {
      return {
        valid: false,
        error: `Invalid IPv6 address format: '${cleanHost}' contains invalid hexadecimal characters.`,
        cleanTarget: cleanHost,
      };
    }
    return { valid: true, cleanTarget: cleanHost };
  }

  // Domain Name Validation (RFC 1123)
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  if (!domainRegex.test(lower)) {
    return {
      valid: false,
      error: `Invalid hostname '${cleanHost}'. Please enter a valid domain name (e.g., scanme.nmap.org) or IP address (e.g., 127.0.0.1).`,
      cleanTarget: cleanHost,
    };
  }

  return { valid: true, cleanTarget: cleanHost };
}

// Client-side Port List Validation supporting single ports and ranges (e.g., 80, 443, 1-1024)
export function validatePorts(portsInputStr: string): {
  valid: boolean;
  ports: number[];
  error?: string;
  isTruncated?: boolean;
} {
  const raw = (portsInputStr || '').trim();
  if (!raw) {
    return { valid: false, ports: [], error: 'Please enter at least one port number (1-65535).' };
  }

  const tokens = raw.split(',').map((t) => t.trim()).filter(Boolean);
  const validPorts: number[] = [];
  const invalidTokens: string[] = [];

  for (const tok of tokens) {
    // Support range format like "1-1024" or "80-90"
    if (tok.includes('-')) {
      const parts = tok.split('-').map((p) => p.trim());
      if (parts.length === 2 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);
        if (start >= 1 && end <= 65535 && start <= end) {
          // If range is large (like 1-1024), cap expansion to prevent memory/browser freeze
          const rangeCount = Math.min(end - start + 1, 100);
          for (let p = 0; p < rangeCount; p++) {
            validPorts.push(start + p);
          }
          continue;
        }
      }
      invalidTokens.push(tok);
      continue;
    }

    if (!/^\d+$/.test(tok)) {
      invalidTokens.push(tok);
      continue;
    }
    const p = parseInt(tok, 10);
    if (p < 1 || p > 65535) {
      invalidTokens.push(tok);
    } else {
      validPorts.push(p);
    }
  }

  if (invalidTokens.length > 0) {
    return {
      valid: false,
      ports: [],
      error: `Invalid port or range [${invalidTokens.join(', ')}]. Port numbers must be positive integers between 1 and 65535 (e.g. 80, 443 or 80-90).`,
    };
  }

  const unique = Array.from(new Set(validPorts));
  if (unique.length === 0) {
    return {
      valid: false,
      ports: [],
      error: 'No valid port numbers found. Please specify ports between 1 and 65535 (e.g., 80, 443).',
    };
  }

  return {
    valid: true,
    ports: unique.slice(0, 100),
    isTruncated: unique.length > 100,
  };
}

// Safe API caller using fetch() with response status checks, content-type verification, and rate-limit handling
async function safeApiPost<T = any>(
  endpointPath: string,
  body: any,
  signal?: AbortSignal
): Promise<{ ok: boolean; data?: T; error?: string; status?: number }> {
  const fullUrl = getApiEndpoint(endpointPath);
  try {
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      signal,
    });

    const status = res.status;
    const contentType = (res.headers.get('content-type') || '').toLowerCase();

    // 1. Strict Content-Type inspection before attempting JSON parsing
    if (!contentType.includes('application/json')) {
      const responseText = await res.text().catch(() => '');
      const isHtmlResponse =
        contentType.includes('text/html') ||
        responseText.trim().startsWith('<!DOCTYPE') ||
        responseText.trim().startsWith('<html') ||
        responseText.includes('<head>') ||
        responseText.includes('id="root"');

      let errorMsg: string;
      if (isHtmlResponse) {
        if (status === 502 || status === 503 || status === 504) {
          errorMsg = `Backend Gateway Unavailable (${status} ${res.statusText || 'Waking Up'}). Your Render FastAPI service is spinning up from cold sleep (takes ~30-50s on free tier). Please wait 30 seconds and retry.`;
        } else {
          errorMsg = `Netlify returned an HTML page instead of API JSON response (${status} ${res.statusText || 'OK'}). The endpoint ${fullUrl} was intercepted by Netlify's Single-Page App redirect. Verify that the Python FastAPI backend is live at ${BACKEND_URL} and that Netlify has VITE_API_BASE_URL configured in Site configuration -> Environment variables.`;
        }
      } else {
        errorMsg = `Server at ${fullUrl} returned non-JSON data (${status} ${res.statusText || 'OK'}, Content-Type: ${contentType || 'unknown'}).`;
      }

      return {
        ok: false,
        status,
        error: errorMsg,
      };
    }

    // 2. Safe JSON parsing
    let data: any;
    try {
      data = await res.json();
    } catch (parseErr) {
      return {
        ok: false,
        status,
        error: `Failed to parse backend JSON response (${status}): ${parseErr instanceof Error ? parseErr.message : 'Invalid JSON'}`,
      };
    }

    // 3. HTTP status checks
    if (!res.ok) {
      // Rate Limiting (HTTP 429)
      if (status === 429) {
        const retryAfter = res.headers.get('retry-after') || data?.retryAfter || 'a few';
        const rateLimitMsg =
          data?.error ||
          data?.detail ||
          `Rate limit exceeded (HTTP 429): Too many scan requests. Please wait ${retryAfter} seconds before trying again.`;
        return {
          ok: false,
          status,
          error: rateLimitMsg,
        };
      }

      // Authorization / Forbidden (HTTP 403)
      if (status === 403) {
        return {
          ok: false,
          status,
          error: data?.error || data?.detail || 'Forbidden (HTTP 403): Scanning this target is not authorized.',
        };
      }

      // Endpoint Not Found (HTTP 404)
      if (status === 404) {
        return {
          ok: false,
          status,
          error: data?.error || `API endpoint not found (HTTP 404 at ${fullUrl}). Verify backend routes.`,
        };
      }

      // Backend Server Errors (HTTP 500+)
      if (status >= 500) {
        return {
          ok: false,
          status,
          error: data?.error || data?.detail || `FastAPI backend error (HTTP ${status}). Check Render backend logs.`,
        };
      }

      return {
        ok: false,
        status,
        error: data?.error || data?.detail || `Server returned error (${status})`,
      };
    }

    return { ok: true, status, data };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        ok: false,
        error: 'Scan was stopped by user or request timed out.',
      };
    }

    // CORS & Network connection errors
    const isNetworkError =
      err instanceof TypeError &&
      (err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('NetworkError') ||
        err?.message?.includes('Load failed'));

    if (isNetworkError) {
      return {
        ok: false,
        error: `Could not connect to Python backend at ${BACKEND_URL}. Check if the Render service is online, CORS is allowed, and no browser extension is blocking cross-origin requests.`,
      };
    }

    return {
      ok: false,
      error: `Could not reach Python backend at ${BACKEND_URL}: ${err?.message || 'Network connection failed'}. If the Render backend was sleeping, please wait ~30s for it to wake up.`,
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

  const abortControllerRef = useRef<AbortController | null>(null);
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
      const res = await fetch(getApiEndpoint('/api/my-ip'), {
        headers: { Accept: 'application/json' },
      });
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.ip) {
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

      if (res.status === 429) {
        addLog('Client IP rate limited (HTTP 429). Using 127.0.0.1', 'filtered');
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

  // Start Scanning Execution via fetch() (Requirement 6, 7 & 8)
  const handleStartScan = async () => {
    setErrorMessage(null);

    // 1. Pre-flight Target IP / Hostname Validation
    const targetValidation = validateTarget(host);
    if (!targetValidation.valid) {
      const err = targetValidation.error || t.invalidHost;
      setErrorMessage(err);
      addLog(`[Target Validation] ${err}`, 'error');
      return;
    }

    // 2. Pre-flight Port Numbers Validation
    const portsValidation = validatePorts(portsInput);
    if (!portsValidation.valid) {
      const err = portsValidation.error || 'Please enter valid ports between 1 and 65535.';
      setErrorMessage(err);
      addLog(`[Port Validation] ${err}`, 'error');
      return;
    }

    const cleanPorts = [...portsValidation.ports];
    if (portsValidation.isTruncated) {
      addLog('[Port Range] Range contains over 100 ports. Scanning the first 100 ports to prevent network flooding.', 'info');
    }

    setIsScanning(true);
    isScanFinishedRef.current = false;
    resultsCountRef.current = 0;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

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

    const clientTarget = cleanClientTarget(host);
    let targetToScan = clientTarget.cleanHost;
    if (clientTarget.detectedPort && !cleanPorts.includes(clientTarget.detectedPort)) {
      cleanPorts.push(clientTarget.detectedPort);
      addLog(`[Auto-detect] Added port ${clientTarget.detectedPort} from URL`, 'info');
    }

    // Step 1: Resolve DNS / Validate Target Authorization via fetch()
    try {
      addLog(`[DNS] Resolving target ${host}...`, 'info');
      const resolveResult = await safeApiPost(
        '/api/resolve-target',
        { target: host },
        abortController.signal
      );

      if (resolveResult.ok && resolveResult.data) {
        const resolveData = resolveResult.data;
        if (resolveData.valid === false && resolveData.error) {
          setErrorMessage(resolveData.error);
          addLog(`[Unauthorized Target] ${resolveData.error}`, 'error');
          setIsScanning(false);
          return;
        }

        setResolvedIpInfo(resolveData);
        targetToScan = resolveData.host || targetToScan;
        addLog(
          currentLang === 'pa'
            ? `ਟਾਰਗਿਟ ਹੱਲ: ${resolveData.host} -> ${resolveData.ip} (${resolveData.version})`
            : `Target resolved: ${resolveData.host} -> ${resolveData.ip} (${resolveData.version})`,
          'info'
        );
        if (resolveData.detectedPort && !cleanPorts.includes(resolveData.detectedPort)) {
          cleanPorts.push(resolveData.detectedPort);
          addLog(
            `[Auto-detect] Added port ${resolveData.detectedPort} from URL`,
            'info'
          );
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      addLog(`[DNS] Continuing scan with ${targetToScan}`, 'info');
    }

    if (abortController.signal.aborted) return;

    addLog(
      currentLang === 'pa'
        ? `\nਸਕੈਨਿੰਗ ਸ਼ੁਰੂ ਹੋ ਰਹੀ ਹੈ: ${targetToScan} (Python TCP socket)...\n`
        : `\nScanning target: ${targetToScan} using Python TCP sockets...\n`,
      'info',
      false
    );

    // Step 2: Execute TCP Port Scan via fetch() (Requirement 6, 7 & 8)
    const scanResponse = await safeApiPost<{
      host: string;
      resolvedIp?: string;
      scannedCount: number;
      openCount: number;
      closedCount: number;
      filteredCount: number;
      results: ScanResultItem[];
      error?: string;
    }>(
      '/api/scan',
      {
        host: targetToScan,
        ports: cleanPorts,
        timeout: timeoutSec,
      },
      abortController.signal
    );

    if (abortController.signal.aborted) return;

    if (!scanResponse.ok || scanResponse.error) {
      const errMsg = scanResponse.error || 'Scan failed';
      addLog(`[Scan Error] ${errMsg}`, 'error');
      setErrorMessage(errMsg);
      setIsScanning(false);
      return;
    }

    const scanData = scanResponse.data;
    if (scanData?.error) {
      addLog(`[Scan Error] ${scanData.error}`, 'error');
      setErrorMessage(scanData.error);
      setIsScanning(false);
      return;
    }

    if (scanData && Array.isArray(scanData.results)) {
      setResults(scanData.results);
      resultsCountRef.current = scanData.results.length;

      scanData.results.forEach((r) => {
        if (r.status === 'OPEN') {
          addLog(
            `[OPEN] Port ${r.port} (${r.service?.name || 'TCP'}) - ${r.latencyMs}ms`,
            'open'
          );
        } else if (r.status === 'FILTERED') {
          addLog(
            `[CLOSED/FILTERED] Port ${r.port} (${r.service?.name || 'TCP'}) - ${r.error || 'Timed out / Filtered'}`,
            'filtered'
          );
        } else {
          addLog(
            `[CLOSED] Port ${r.port} (${r.service?.name || 'TCP'}) - ${r.error || 'Connection refused (RST)'}`,
            'closed'
          );
        }
      });

      addLog(
        `\n===== ${currentLang === 'pa' ? 'ਸਕੈਨ ਮੁਕੰਮਲ' : 'SCAN COMPLETE'} (${scanData.openCount} open, ${scanData.closedCount} closed, ${scanData.filteredCount} filtered) =====`,
        'header',
        false
      );
    } else {
      addLog('Scan returned no results from backend.', 'error');
    }

    setIsScanning(false);
  };

  // Stop current scan
  const handleStopScan = () => {
    isScanFinishedRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
