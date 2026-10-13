import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2, BookOpen, Server, Globe, ExternalLink } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

const FASTAPI_BACKEND_CODE = `"""
Port Scanner by Kunal - FastAPI Backend
Production-ready TCP port scanner using Python socket, socket.SOCK_STREAM, and connect_ex().

Deploy to Render, Railway, Fly.io, or VPS and connect to Netlify via VITE_API_BASE_URL.
"""

import os
import time
import errno
import socket
import ipaddress
from typing import List, Optional
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

app = FastAPI(title="Port Scanner by Kunal - API", version="1.0.0")

# Enable CORS for Netlify frontend and local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WELL_KNOWN_SERVICES = {
    21: {"name": "FTP", "description": "File Transfer Protocol", "protocol": "TCP"},
    22: {"name": "SSH", "description": "Secure Shell Remote Login", "protocol": "TCP"},
    25: {"name": "SMTP", "description": "Simple Mail Transfer Protocol", "protocol": "TCP"},
    80: {"name": "HTTP", "description": "HyperText Transfer Protocol (Web)", "protocol": "TCP"},
    443: {"name": "HTTPS", "description": "HTTP Secure (TLS Encrypted Web)", "protocol": "TCP"},
    3000: {"name": "Dev-Server", "description": "React / Node.js Dev Web Port", "protocol": "TCP"},
    3306: {"name": "MySQL", "description": "MySQL Database Server", "protocol": "TCP"},
    5432: {"name": "PostgreSQL", "description": "PostgreSQL Database Engine", "protocol": "TCP"},
    6379: {"name": "Redis", "description": "Redis Key-Value Store", "protocol": "TCP"},
    8080: {"name": "HTTP-Proxy", "description": "Alternative HTTP Web Proxy", "protocol": "TCP"},
}

AUTHORIZED_HOSTS = {
    "localhost", "127.0.0.1", "::1", "0.0.0.0",
    "scanme.nmap.org", "google.com", "cloudflare.com", "1.1.1.1", "8.8.8.8", "github.com",
}

def sanitize_target_host(raw: str) -> str:
    val = (raw or "").strip().lower()
    if val in ("google", "chrome"): return "google.com"
    if "://" in val:
        try:
            return urlparse(val).hostname or "localhost"
        except Exception:
            val = val.split("://", 1)[1]
    val = val.split("/")[0].split("?")[0].strip("[]")
    if ":" in val and val.count(":") == 1:
        val = val.split(":")[0]
    return val or "localhost"

def is_target_authorized(host: str) -> tuple[bool, str]:
    if host in AUTHORIZED_HOSTS or host.endswith(".google.com"):
        return True, "Authorized"
    try:
        ip = ipaddress.ip_address(host)
        if ip.is_loopback: return True, "Loopback"
        if ip.is_private:
            return False, f"Scanning private network address ({host}) is restricted. Only localhost or authorized test targets can be scanned."
        return True, "Public IP"
    except ValueError:
        if "." in host and not host.endswith(".local") and not host.endswith(".internal"):
            return True, "Public domain"
        return False, f"Target '{host}' not authorized. Allowed: localhost, 127.0.0.1, scanme.nmap.org."

def scan_single_port(ip: str, port: int, timeout_sec: float = 1.0) -> dict:
    family = socket.AF_INET6 if ":" in ip else socket.AF_INET
    s = socket.socket(family, socket.SOCK_STREAM)
    s.settimeout(timeout_sec)
    start_time = time.time()
    try:
        result = s.connect_ex((ip, port))
        latency = int((time.time() - start_time) * 1000)
        if result == 0:
            status, err = "OPEN", None
        elif result in (errno.ECONNREFUSED, 111):
            status, err = "CLOSED", "Connection refused (RST received)"
        elif result in (errno.ETIMEDOUT, 110):
            status, err = "FILTERED", "Connection timed out"
        else:
            status, err = "CLOSED", f"Socket code {result}"
    except socket.timeout:
        latency = int((time.time() - start_time) * 1000)
        status, err = "FILTERED", "Timeout"
    except Exception as e:
        latency, status, err = 0, "CLOSED", str(e)
    finally:
        s.close()
    return {
        "port": port,
        "status": status,
        "latencyMs": max(latency, 1) if status == "OPEN" else latency,
        "service": WELL_KNOWN_SERVICES.get(port, {"name": f"Port {port}", "protocol": "TCP"}),
        "error": err,
    }

class ScanRequest(BaseModel):
    host: Optional[str] = "localhost"
    target: Optional[str] = None
    ports: Optional[List[int]] = None
    timeout: Optional[float] = 1.0

@app.api_route("/api/scan", methods=["GET", "POST"])
def scan_endpoint(req: Request, body: Optional[ScanRequest] = None):
    raw_host = (body.host or body.target if body else None) or req.query_params.get("host") or "localhost"
    target = sanitize_target_host(raw_host)
    auth, reason = is_target_authorized(target)
    if not auth:
        return {"host": target, "scannedCount": 0, "results": [], "error": reason}
    
    ports = (body.ports if body and body.ports else None) or [80, 443]
    clean_ports = sorted(list(dict.fromkeys([p for p in ports if 1 <= p <= 65535])))[:100]
    timeout = min(max(float(body.timeout if body else 1.0), 0.2), 5.0)

    try:
        resolved_ip = socket.gethostbyname(target)
    except socket.gaierror:
        resolved_ip = target

    results = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(scan_single_port, resolved_ip, p, timeout): p for p in clean_ports}
        for f in as_completed(futures):
            results.append(f.result())

    results.sort(key=lambda r: r["port"])
    return {
        "host": target,
        "resolvedIp": resolved_ip,
        "scannedCount": len(results),
        "openCount": sum(1 for r in results if r["status"] == "OPEN"),
        "closedCount": sum(1 for r in results if r["status"] == "CLOSED"),
        "filteredCount": sum(1 for r in results if r["status"] == "FILTERED"),
        "results": results,
    }

@app.api_route("/api/resolve-target", methods=["GET", "POST"])
def resolve_endpoint(req: Request):
    raw = req.query_params.get("target") or req.query_params.get("host") or "localhost"
    target = sanitize_target_host(raw)
    auth, reason = is_target_authorized(target)
    if not auth:
        return {"valid": False, "host": target, "error": reason}
    try:
        ip = socket.gethostbyname(target)
        return {"valid": True, "host": target, "ip": ip, "version": "IPv4"}
    except socket.gaierror as e:
        return {"valid": False, "host": target, "error": str(e)}

@app.get("/api/my-ip")
def my_ip_endpoint(req: Request):
    f = req.headers.get("x-forwarded-for")
    return {"ip": f.split(",")[0].strip() if f else req.client.host or "127.0.0.1"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))`;

const CLI_SCANNER_CODE = `#!/usr/bin/env python3
"""
Port Scanner by Kunal - Standalone CLI Scanner
Run directly in terminal with Python sockets!
"""

import socket
import sys
import time
import errno
import json
import argparse
import ipaddress
from concurrent.futures import ThreadPoolExecutor, as_completed

def scan_single_port(host: str, port: int, timeout_sec: float = 1.0) -> dict:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout_sec)
    start = time.time()
    try:
        res = s.connect_ex((host, port))
        latency = int((time.time() - start) * 1000)
        status = "OPEN" if res == 0 else "CLOSED"
    except socket.timeout:
        status, latency = "FILTERED", int((time.time() - start) * 1000)
    finally:
        s.close()
    return {"port": port, "status": status, "latencyMs": latency}

def main():
    parser = argparse.ArgumentParser(description="Port Scanner by Kunal")
    parser.add_argument("--host", default="127.0.0.1", help="Target host")
    parser.add_argument("--ports", default="80,443,3000", help="Comma-separated ports")
    parser.add_argument("--timeout", type=float, default=1.0)
    args = parser.parse_args()

    ports = [int(p) for p in args.ports.split(",") if p.strip().isdigit()]
    print(f"Scanning {args.host} for ports: {ports}...")
    with ThreadPoolExecutor(max_workers=20) as ex:
        results = list(ex.map(lambda p: scan_single_port(args.host, p, args.timeout), ports))
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()`;

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const [activeTab, setActiveTab] = useState<'fastapi' | 'cli' | 'netlify'>('fastapi');
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[currentLang];

  if (!isOpen) return null;

  const currentCode = activeTab === 'fastapi' ? FASTAPI_BACKEND_CODE : CLI_SCANNER_CODE;
  const filename = activeTab === 'fastapi' ? 'main.py' : 'scanner.py';

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
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
                  {filename}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {currentLang === 'pa'
                  ? 'ਪਾਈਥਨ FastAPI ਬੈਕਐਂਡ ਅਤੇ Netlify ਸੰਰਚਨਾ'
                  : 'Python FastAPI Backend & Netlify Setup'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'netlify' && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.downloadPy}</span>
              </button>
            )}

            <button
              onClick={() => handleCopy(currentCode)}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/90 px-6 pt-2">
          <button
            onClick={() => setActiveTab('fastapi')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'fastapi'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>FastAPI Backend (`main.py`)</span>
          </button>

          <button
            onClick={() => setActiveTab('netlify')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'netlify'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Netlify Setup & Env Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'cli'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Code2 className="h-4 w-4" />
            <span>CLI Scanner (`scanner.py`)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-4">
          {activeTab === 'netlify' ? (
            <div className="space-y-4 font-sans text-xs text-slate-700 dark:text-slate-300">
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-4">
                <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm mb-1">
                  Why Netlify gave &quot;Scan failed: Connected to host&quot;
                </h4>
                <p className="leading-relaxed">
                  Netlify is a static web host and cannot execute Python sockets inside browser JavaScript. When your frontend made a request to <code>/api/scan</code>, Netlify served <code>index.html</code> instead of the Python backend JSON.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                <h4 className="font-bold text-blue-950 dark:text-white text-sm">
                  Step 1: Deploy Python FastAPI Backend (Render or Railway)
                </h4>
                <p>Deploy <code>main.py</code> to Render.com (free) or Railway.app:</p>
                <div className="rounded-xl bg-slate-900 p-3 text-emerald-400 font-mono">
                  pip install -r requirements.txt<br />
                  uvicorn main:app --host 0.0.0.0 --port $PORT
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                <h4 className="font-bold text-blue-950 dark:text-white text-sm">
                  Step 2: Connect Netlify Frontend to Backend
                </h4>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Go to your Netlify Dashboard &rarr; <strong>Site configuration</strong> &rarr; <strong>Environment variables</strong>.</li>
                  <li>Add variable name: <code className="bg-blue-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">VITE_API_BASE_URL</code></li>
                  <li>Value: <code className="bg-blue-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">https://your-backend.onrender.com</code> (your deployed FastAPI URL)</li>
                  <li>Click <strong>Trigger deploy</strong> &rarr; <strong>Clear cache and deploy site</strong>.</li>
                </ol>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-blue-900 bg-blue-950 p-4 shadow-inner overflow-x-auto text-emerald-300 leading-relaxed select-text">
                <pre>
                  <code>{currentCode}</code>
                </pre>
              </div>

              {/* Explanation Section */}
              <div className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-blue-50/50 dark:bg-slate-950/70 p-4 font-sans text-xs text-blue-950 dark:text-slate-200 space-y-2">
                <h4 className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>How This Socket Scanner Operates</span>
                </h4>
                <div className="grid gap-2 text-slate-600 dark:text-slate-400 leading-relaxed sm:grid-cols-3 pt-1">
                  <div className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                    <span className="font-bold text-blue-950 dark:text-white block mb-1">
                      1. TCP Socket (`SOCK_STREAM`)
                    </span>
                    <span>
                      Opens raw OS socket connections with standard TCP SYN packets.
                    </span>
                  </div>
                  <div className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                    <span className="font-bold text-blue-950 dark:text-white block mb-1">
                      2. Handshake (`connect_ex`)
                    </span>
                    <span>
                      Returns 0 on SYN-ACK (Open), ECONNREFUSED on RST (Closed), ETIMEDOUT (Filtered).
                    </span>
                  </div>
                  <div className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                    <span className="font-bold text-blue-950 dark:text-white block mb-1">
                      3. Target Authorization
                    </span>
                    <span>
                      Restricts scans to localhost, 127.0.0.1, scanme.nmap.org, and authorized public hosts.
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
