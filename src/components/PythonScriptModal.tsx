import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2, BookOpen } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

const PYTHON_SCRIPT_CODE = `#!/usr/bin/env python3
"""
Port Scanner by Kunal - TCP Socket Engine & Backend
Provides TCP socket scanning, timeout management, target authorization,
and JSON responses.

How to install dependencies and run:
  1. No external dependencies required! (Uses standard library: socket, time, json, ipaddress)
  2. Optional dependencies: pip install -r requirements.txt
  3. Run CLI Scan:
     python3 scanner.py --host 127.0.0.1 --ports 80,443,3000 --timeout 1.0
  4. Run Python HTTP API Server:
     python3 app.py --port 5000
"""

import socket
import sys
import time
import errno
import json
import argparse
import ipaddress
from concurrent.futures import ThreadPoolExecutor, as_completed

AUTHORIZED_HOSTS = {
    "localhost", "127.0.0.1", "::1", "0.0.0.0",
    "scanme.nmap.org", "google.com", "www.google.com",
    "cloudflare.com", "1.1.1.1", "8.8.8.8", "github.com",
}

def is_target_authorized(host: str) -> tuple[bool, str]:
    clean = host.lower().strip()
    if clean in AUTHORIZED_HOSTS or clean.endswith(".google.com"):
        return True, "Authorized target"
    try:
        ip = ipaddress.ip_address(clean)
        if ip.is_loopback:
            return True, "Authorized loopback address"
        if ip.is_private:
            return False, f"Scanning private network address {clean} is restricted. Use localhost/127.0.0.1."
        return True, "Authorized public IP"
    except ValueError:
        if "." in clean and not clean.endswith(".local"):
            return True, "Authorized domain"
        return False, f"Target '{clean}' not authorized. Allowed: localhost, 127.0.0.1, scanme.nmap.org."

def scan_single_port(host: str, port: int, timeout_sec: float = 1.0) -> dict:
    is_auth, auth_msg = is_target_authorized(host)
    if not is_auth:
        return {"port": port, "status": "CLOSED", "latencyMs": 0, "error": auth_msg}

    family = socket.AF_INET6 if ":" in host else socket.AF_INET
    s = socket.socket(family, socket.SOCK_STREAM)
    s.settimeout(timeout_sec)
    start_time = time.time()

    try:
        result = s.connect_ex((host, port))
        latency_ms = int((time.time() - start_time) * 1000)
        if result == 0:
            status = "OPEN"
            error = None
        elif result in (errno.ECONNREFUSED, 111):
            status = "CLOSED"
            error = "Connection refused (RST received)"
        elif result in (errno.ETIMEDOUT, 110):
            status = "FILTERED"
            error = "Connection timed out"
        else:
            status = "CLOSED"
            error = f"Socket code {result}"
    except socket.timeout:
        latency_ms = int((time.time() - start_time) * 1000)
        status = "FILTERED"
        error = "Timeout"
    except Exception as e:
        latency_ms = 0
        status = "CLOSED"
        error = str(e)
    finally:
        s.close()

    return {
        "port": port,
        "status": status,
        "latencyMs": latency_ms,
        "error": error,
    }

def scan_ports(host: str, ports: list[int], timeout_sec: float = 1.0) -> dict:
    is_auth, auth_msg = is_target_authorized(host)
    if not is_auth:
        return {"host": host, "scannedCount": 0, "results": [], "error": auth_msg}

    results = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        future_map = {executor.submit(scan_single_port, host, p, timeout_sec): p for p in ports}
        for future in as_completed(future_map):
            results.append(future.result())

    results.sort(key=lambda r: r["port"])
    return {
        "host": host,
        "scannedCount": len(results),
        "openCount": sum(1 for r in results if r["status"] == "OPEN"),
        "closedCount": sum(1 for r in results if r["status"] == "CLOSED"),
        "filteredCount": sum(1 for r in results if r["status"] == "FILTERED"),
        "results": results,
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Port Scanner by Kunal")
    parser.add_argument("--host", default="127.0.0.1", help="Target host/IP")
    parser.add_argument("--ports", default="80,443,3000", help="Comma-separated ports")
    parser.add_argument("--timeout", type=float, default=1.0, help="Timeout in seconds")
    args = parser.parse_args()

    ports = [int(p) for p in args.ports.split(",") if p.strip().isdigit()]
    res = scan_ports(args.host, ports, args.timeout)
    print(json.dumps(res, indent=2))`;

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[currentLang];

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([PYTHON_SCRIPT_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'port_scanner.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-blue-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-800 bg-blue-50/60 dark:bg-slate-850 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-blue-950 dark:text-white flex items-center gap-2">
                <span>{t.pythonScriptTab}</span>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950/80 px-2.5 py-0.5 text-[11px] font-mono font-bold text-blue-700 dark:text-blue-300">
                  port_scanner.py
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {currentLang === 'pa'
                  ? 'ਤੁਹਾਡਾ ਅਸਲੀ ਪਾਈਥਨ ਸਾਕਟ ਕੋਡ'
                  : 'Original Python TCP socket port scanner script'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.downloadPy}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? t.copied : t.copyCode}</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-blue-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-4">
          <div className="rounded-2xl border border-blue-900 bg-blue-950 p-4 shadow-inner overflow-x-auto text-emerald-300 leading-relaxed select-text">
            <pre>
              <code>{PYTHON_SCRIPT_CODE}</code>
            </pre>
          </div>

          {/* Explanation Section */}
          <div className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-blue-50/50 dark:bg-slate-950/70 p-4 font-sans text-xs text-blue-950 dark:text-slate-200 space-y-2">
            <h4 className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>
                {currentLang === 'pa'
                  ? 'ਕੋਡ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ? (ਵੇਰਵਾ)'
                  : 'How This Socket Code Works'}
              </span>
            </h4>
            <div className="grid gap-2 text-slate-600 dark:text-slate-400 leading-relaxed sm:grid-cols-3 pt-1">
              <div className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                <span className="font-bold text-blue-950 dark:text-white block mb-1">
                  1. TCP Socket (`SOCK_STREAM`)
                </span>
                <span>
                  Creates a standard stream socket communicating over IPv4 TCP stack to test handshake.
                </span>
              </div>
              <div className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                <span className="font-bold text-blue-950 dark:text-white block mb-1">
                  2. Connection Test (`connect_ex`)
                </span>
                <span>
                  Returns `0` on successful SYN-ACK handshake (Open Port), or error code (Closed/Filtered).
                </span>
              </div>
              <div className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                <span className="font-bold text-blue-950 dark:text-white block mb-1">
                  3. Timeout Protection
                </span>
                <span>
                  Prevents socket hangs against dropped packets and silent packet drops on strict firewalls.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
