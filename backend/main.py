"""
Port Scanner by Kunal - FastAPI Backend Service
TCP Port Scanner using Python sockets, socket.SOCK_STREAM, and connect_ex().

Provides REST API endpoints for:
- /api/scan (TCP port scanning with timeouts and concurrency)
- /api/resolve-target (DNS resolution and target authorization check)
- /api/my-ip (Requester IP detection)
- /api/health (Health check)
"""

import os
import sys
import time
import errno
import socket
import inspect
import ipaddress
import threading
from functools import wraps
from collections import defaultdict, deque
from typing import List, Optional
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Thread-safe in-memory sliding window rate limiter with target concurrency protection
class InMemoryRateLimiter:
    """
    Protects:
    1. Maximum requests per time window per client IP (sliding window).
    2. Maximum concurrent in-flight scans per client IP.
    3. Maximum concurrent scans per target host to prevent flooding scan destinations.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self._history = defaultdict(deque)  # client_ip -> deque of timestamps
        self._active_concurrency = defaultdict(int)  # key -> active count

    def check_rate_limit(self, client_ip: str, max_requests: int, window_seconds: float) -> tuple[bool, int, int]:
        now = time.time()
        with self._lock:
            q = self._history[client_ip]
            cutoff = now - window_seconds
            while q and q[0] <= cutoff:
                q.popleft()

            if len(q) < max_requests:
                q.append(now)
                remaining = max_requests - len(q)
                return True, remaining, 0
            else:
                retry_after = max(1, int(window_seconds - (now - q[0])))
                return False, 0, retry_after

    def acquire_concurrency(self, key: str, max_concurrent: int) -> bool:
        with self._lock:
            if self._active_concurrency[key] >= max_concurrent:
                return False
            self._active_concurrency[key] += 1
            return True

    def release_concurrency(self, key: str):
        with self._lock:
            if self._active_concurrency[key] > 0:
                self._active_concurrency[key] -= 1


GLOBAL_RATE_LIMITER = InMemoryRateLimiter()


def rate_limit(
    max_requests: int = 30,
    window_seconds: float = 60.0,
    max_concurrent: Optional[int] = None,
    protect_target: bool = False,
    max_target_concurrent: int = 2,
):
    """
    Rate limiting & concurrency decorator for FastAPI route handlers.
    - Enforces sliding window request rate limit per client IP.
    - Limits concurrent scans per client IP.
    - Protects destination targets from excessive concurrent TCP probes.
    - Returns HTTP 429 Too Many Requests with Retry-After and rate limit headers.
    """
    def decorator(func):
        is_async = inspect.iscoroutinefunction(func)

        def _process_limits(args, kwargs):
            req: Optional[Request] = kwargs.get("req") or kwargs.get("request")
            if not req:
                for arg in args:
                    if isinstance(arg, Request):
                        req = arg
                        break

            client_ip = "127.0.0.1"
            if req:
                fwd = req.headers.get("x-forwarded-for")
                if fwd:
                    client_ip = fwd.split(",")[0].strip()
                elif req.client and req.client.host:
                    client_ip = req.client.host
                if client_ip.startswith("::ffff:"):
                    client_ip = client_ip[7:]

            # 1. Enforce sliding window request rate limit
            allowed, remaining, retry_after = GLOBAL_RATE_LIMITER.check_rate_limit(
                client_ip=client_ip,
                max_requests=max_requests,
                window_seconds=window_seconds,
            )

            if not allowed:
                return False, JSONResponse(
                    status_code=429,
                    headers={
                        "Retry-After": str(retry_after),
                        "X-RateLimit-Limit": str(max_requests),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(retry_after),
                    },
                    content={
                        "error": f"Rate limit exceeded: Maximum {max_requests} requests per {int(window_seconds)}s. Please retry after {retry_after} seconds.",
                        "detail": "Rate limit exceeded",
                        "retryAfter": retry_after,
                        "limit": max_requests,
                        "windowSeconds": window_seconds,
                    },
                ), None, None

            # 2. Enforce client concurrency limit if configured
            client_concurrency_key = f"client:{client_ip}"
            if max_concurrent is not None:
                acquired_client = GLOBAL_RATE_LIMITER.acquire_concurrency(client_concurrency_key, max_concurrent)
                if not acquired_client:
                    return False, JSONResponse(
                        status_code=429,
                        headers={"Retry-After": "3"},
                        content={
                            "error": f"Concurrent scan limit reached ({max_concurrent} active scans). Please wait for your in-flight scan to finish before starting another.",
                            "detail": "Too many concurrent requests",
                            "retryAfter": 3,
                        },
                    ), None, None
            else:
                client_concurrency_key = None

            # 3. Enforce target-specific concurrency limit to protect destination hosts
            target_concurrency_key = None
            if protect_target:
                body_obj = kwargs.get("body")
                target_val = None
                if body_obj:
                    target_val = getattr(body_obj, "host", None) or getattr(body_obj, "target", None)
                if not target_val and req:
                    target_val = req.query_params.get("host") or req.query_params.get("target")

                if target_val:
                    cleaned_target = str(target_val).strip().lower().split(":")[0].strip("[]")
                    if cleaned_target:
                        target_concurrency_key = f"target:{cleaned_target}"
                        acquired_target = GLOBAL_RATE_LIMITER.acquire_concurrency(target_concurrency_key, max_target_concurrent)
                        if not acquired_target:
                            if client_concurrency_key:
                                GLOBAL_RATE_LIMITER.release_concurrency(client_concurrency_key)
                            return False, JSONResponse(
                                status_code=429,
                                headers={"Retry-After": "5"},
                                content={
                                    "error": f"Target protection: Target host '{cleaned_target}' is currently receiving active scan probes. Please wait a few seconds before initiating another scan against this target.",
                                    "detail": "Target concurrent scan limit reached",
                                    "retryAfter": 5,
                                },
                            ), None, None

            return True, None, client_concurrency_key, target_concurrency_key

        if is_async:
            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                allowed, err_resp, c_key, t_key = _process_limits(args, kwargs)
                if not allowed:
                    return err_resp
                try:
                    return await func(*args, **kwargs)
                finally:
                    if t_key:
                        GLOBAL_RATE_LIMITER.release_concurrency(t_key)
                    if c_key:
                        GLOBAL_RATE_LIMITER.release_concurrency(c_key)
            async_wrapper.__signature__ = inspect.signature(func)
            return async_wrapper
        else:
            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                allowed, err_resp, c_key, t_key = _process_limits(args, kwargs)
                if not allowed:
                    return err_resp
                try:
                    return func(*args, **kwargs)
                finally:
                    if t_key:
                        GLOBAL_RATE_LIMITER.release_concurrency(t_key)
                    if c_key:
                        GLOBAL_RATE_LIMITER.release_concurrency(c_key)
            sync_wrapper.__signature__ = inspect.signature(func)
            return sync_wrapper

    return decorator

app = FastAPI(
    title="Port Scanner by Kunal - API",
    description="TCP Network Port Scanner Backend using Python Sockets",
    version="1.0.0",
)

# Requirement 9: Configure CORS correctly for Netlify website and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins including your Netlify domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Common TCP services lookup
WELL_KNOWN_SERVICES = {
    20: {"name": "FTP-DATA", "description": "File Transfer Protocol Data Channel", "protocol": "TCP"},
    21: {"name": "FTP", "description": "File Transfer Protocol Control/Auth", "protocol": "TCP"},
    22: {"name": "SSH", "description": "Secure Shell & SFTP Remote Login", "protocol": "TCP"},
    23: {"name": "Telnet", "description": "Unencrypted Remote Terminal", "protocol": "TCP"},
    25: {"name": "SMTP", "description": "Simple Mail Transfer Protocol", "protocol": "TCP"},
    53: {"name": "DNS", "description": "Domain Name System Resolution", "protocol": "TCP/UDP"},
    80: {"name": "HTTP", "description": "HyperText Transfer Protocol (Web)", "protocol": "TCP"},
    110: {"name": "POP3", "description": "Post Office Protocol v3 (Mail Retrieval)", "protocol": "TCP"},
    143: {"name": "IMAP", "description": "Internet Message Access Protocol", "protocol": "TCP"},
    443: {"name": "HTTPS", "description": "HTTP Secure (TLS/SSL Encrypted Web)", "protocol": "TCP"},
    445: {"name": "SMB", "description": "Microsoft Directory / SMB File Sharing", "protocol": "TCP"},
    465: {"name": "SMTPS", "description": "Secure SMTP over SSL", "protocol": "TCP"},
    587: {"name": "Submission", "description": "Email Submission with STARTTLS", "protocol": "TCP"},
    993: {"name": "IMAPS", "description": "Secure IMAP over SSL/TLS", "protocol": "TCP"},
    995: {"name": "POP3S", "description": "Secure POP3 over SSL/TLS", "protocol": "TCP"},
    1433: {"name": "MSSQL", "description": "Microsoft SQL Server Database", "protocol": "TCP"},
    1521: {"name": "Oracle-DB", "description": "Oracle Database Listener", "protocol": "TCP"},
    2082: {"name": "cPanel", "description": "cPanel Web Hosting Management", "protocol": "TCP"},
    2083: {"name": "cPanel-SSL", "description": "cPanel Web Hosting Management (SSL)", "protocol": "TCP"},
    3000: {"name": "Dev-Server", "description": "React / Node.js Dev Web Port", "protocol": "TCP"},
    3306: {"name": "MySQL", "description": "MySQL / MariaDB Database Server", "protocol": "TCP"},
    3389: {"name": "RDP", "description": "Remote Desktop Protocol (Windows)", "protocol": "TCP"},
    5000: {"name": "Flask/Dev", "description": "Python Flask Development Server", "protocol": "TCP"},
    5432: {"name": "PostgreSQL", "description": "PostgreSQL Relational Database Engine", "protocol": "TCP"},
    6379: {"name": "Redis", "description": "Redis In-Memory Key-Value Store", "protocol": "TCP"},
    8000: {"name": "FastAPI/Dev", "description": "FastAPI / Django Dev Server", "protocol": "TCP"},
    8080: {"name": "HTTP-Proxy", "description": "Alternative HTTP / Tomcat Proxy", "protocol": "TCP"},
    8443: {"name": "HTTPS-Alt", "description": "Alternative HTTPS SSL Port", "protocol": "TCP"},
    8888: {"name": "Jupyter", "description": "Jupyter Notebook Server", "protocol": "TCP"},
    9000: {"name": "SonarQube/PHP", "description": "SonarQube / PHP FastCGI", "protocol": "TCP"},
    27017: {"name": "MongoDB", "description": "MongoDB NoSQL Document Database", "protocol": "TCP"},
}

# Whitelist of explicitly authorized targets
AUTHORIZED_HOSTS = {
    "localhost",
    "127.0.0.1",
    "::1",
    "0.0.0.0",
    "scanme.nmap.org",
    "google.com",
    "www.google.com",
    "cloudflare.com",
    "1.1.1.1",
    "8.8.8.8",
    "github.com",
}


def sanitize_target_host(raw_target: str) -> dict:
    """
    Cleans target input (strips http://, https://, paths, query strings, and port colons).
    """
    if not raw_target:
        return {"clean_host": "localhost", "detected_port": None}

    val = raw_target.strip()
    lower = val.lower()
    if lower in ("google", "chrome", "safari"):
        return {"clean_host": "google.com", "detected_port": None}

    if "://" in val:
        try:
            parsed = urlparse(val)
            clean_host = parsed.hostname or "localhost"
            return {"clean_host": clean_host.lower(), "detected_port": parsed.port}
        except Exception:
            val = val.split("://", 1)[1]

    val = val.split("/")[0].split("?")[0].split("#")[0].strip()

    detected_port = None
    if ":" in val and not val.startswith("[") and val.count(":") == 1:
        parts = val.split(":")
        val = parts[0]
        try:
            p = int(parts[1])
            if 1 <= p <= 65535:
                detected_port = p
        except ValueError:
            pass

    clean_host = val.strip("[]").strip().lower()
    if not clean_host:
        clean_host = "localhost"

    return {"clean_host": clean_host, "detected_port": detected_port}


def is_target_authorized(host: str) -> tuple[bool, str]:
    """
    Requirement 17: Restrict scanning to authorized targets only.
    Prevents unauthorized SSRF scans against private RFC 1918 subnets.
    """
    clean_host = host.lower().strip()

    if clean_host in AUTHORIZED_HOSTS or clean_host.endswith(".google.com"):
        return True, "Authorized host"

    try:
        ip = ipaddress.ip_address(clean_host)
        if ip.is_loopback:
            return True, "Authorized loopback address"
        if ip.is_private:
            return False, (
                f"Scanning private internal network IP ({clean_host}) is not permitted. "
                "Only localhost (127.0.0.1), scanme.nmap.org, or authorized public domains can be scanned."
            )
        if ip.is_link_local:
            return False, "Scanning link-local IP addresses is not permitted."
        return True, "Authorized public IP"
    except ValueError:
        if "." in clean_host and not clean_host.endswith(".local") and not clean_host.endswith(".internal"):
            return True, "Authorized public domain"
        return False, (
            f"Target '{clean_host}' is not authorized. "
            "Please use localhost (127.0.0.1), scanme.nmap.org, or a valid public domain."
        )


def scan_single_tcp_port(ip: str, port: int, timeout_sec: float = 1.0) -> dict:
    """
    Requirement 5 & 6: Uses Python socket, socket.SOCK_STREAM, and connect_ex().
    Measures accurate latency and distinguishes OPEN, CLOSED, and FILTERED states.
    """
    service_info = WELL_KNOWN_SERVICES.get(
        port,
        {
            "name": f"Port {port}",
            "description": "Custom or unregistered TCP port",
            "protocol": "TCP",
        },
    )

    family = socket.AF_INET6 if ":" in ip else socket.AF_INET
    s = socket.socket(family, socket.SOCK_STREAM)
    s.settimeout(timeout_sec)

    start_time = time.time()
    status = "CLOSED"
    error_msg = None

    try:
        # connect_ex returns 0 when TCP 3-way handshake succeeds
        result = s.connect_ex((ip, port))
        latency_ms = int((time.time() - start_time) * 1000)

        if result == 0:
            status = "OPEN"
        elif result in (errno.ECONNREFUSED, 111):
            status = "CLOSED"
            error_msg = "Connection refused (RST received from target)"
        elif result in (errno.ETIMEDOUT, 110):
            status = "FILTERED"
            error_msg = "Connection timed out (Firewall drop or packet filter)"
        elif result in (errno.EHOSTUNREACH, errno.ENETUNREACH, 113, 101):
            status = "FILTERED"
            error_msg = "Host or network unreachable"
        else:
            status = "CLOSED"
            error_msg = f"Socket error code {result}"

    except socket.timeout:
        latency_ms = int((time.time() - start_time) * 1000)
        status = "FILTERED"
        error_msg = "Connection timed out"
    except (socket.gaierror, socket.herror) as e:
        latency_ms = 0
        status = "CLOSED"
        error_msg = f"DNS resolution failed: {e}"
    except OSError as e:
        latency_ms = int((time.time() - start_time) * 1000)
        status = "CLOSED"
        error_msg = str(e)
    finally:
        try:
            s.close()
        except Exception:
            pass

    return {
        "port": port,
        "status": status,
        "latencyMs": max(latency_ms, 1) if status == "OPEN" else latency_ms,
        "service": service_info,
        "error": error_msg,
    }


class ScanRequest(BaseModel):
    host: Optional[str] = Field(default=None, description="Target host or IP")
    target: Optional[str] = Field(default=None, description="Alternative target field")
    ports: Optional[List[int]] = Field(default=None, description="List of ports to scan")
    timeout: Optional[float] = Field(default=1.0, ge=0.1, le=5.0, description="Socket timeout in seconds")


class ResolveRequest(BaseModel):
    host: Optional[str] = Field(default=None, description="Host to resolve")
    target: Optional[str] = Field(default=None, description="Alternative target field")


@app.get("/")
def root():
    return {
        "app": "Port Scanner by Kunal",
        "status": "online",
        "engine": "Python socket (socket.SOCK_STREAM + connect_ex)",
        "docs": "/docs",
        "endpoints": ["/api/scan", "/api/resolve-target", "/api/my-ip", "/api/health"],
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": time.time()}


@app.api_route("/api/resolve-target", methods=["GET", "POST"])
@rate_limit(max_requests=40, window_seconds=60.0)
def resolve_target_endpoint(req: Request, body: Optional[ResolveRequest] = None):
    raw_target = None
    if body:
        raw_target = body.target or body.host
    if not raw_target:
        raw_target = req.query_params.get("target") or req.query_params.get("host") or "localhost"

    sanitized = sanitize_target_host(str(raw_target))
    clean_host = sanitized["clean_host"]

    is_auth, auth_msg = is_target_authorized(clean_host)
    if not is_auth:
        return {
            "valid": False,
            "host": clean_host,
            "error": auth_msg,
            "detectedPort": sanitized["detected_port"],
        }

    try:
        addr_info = socket.getaddrinfo(clean_host, None)
        ips = list(dict.fromkeys([info[4][0] for info in addr_info]))
        primary_ip = ips[0] if ips else clean_host
        version = "IPv6" if ":" in primary_ip else "IPv4"

        return {
            "valid": True,
            "host": clean_host,
            "ip": primary_ip,
            "allIps": ips,
            "version": version,
            "detectedPort": sanitized["detected_port"],
        }
    except socket.gaierror as e:
        if clean_host in ("localhost", "127.0.0.1"):
            return {
                "valid": True,
                "host": "localhost",
                "ip": "127.0.0.1",
                "allIps": ["127.0.0.1"],
                "version": "IPv4",
                "detectedPort": sanitized["detected_port"],
            }
        return {
            "valid": False,
            "host": clean_host,
            "error": f"Failed to resolve host '{clean_host}': {e}",
            "detectedPort": sanitized["detected_port"],
        }


@app.api_route("/api/scan", methods=["GET", "POST"])
@rate_limit(max_requests=25, window_seconds=60.0, max_concurrent=2, protect_target=True, max_target_concurrent=2)
def scan_endpoint(req: Request, body: Optional[ScanRequest] = None):
    raw_host = None
    raw_ports = None
    timeout = 1.0

    if body:
        raw_host = body.host or body.target
        raw_ports = body.ports
        if body.timeout is not None:
            timeout = body.timeout

    if not raw_host:
        raw_host = req.query_params.get("host") or req.query_params.get("target") or "localhost"
    if not raw_ports and "ports" in req.query_params:
        ports_str = req.query_params.get("ports", "")
        raw_ports = [int(p.strip()) for p in ports_str.split(",") if p.strip().isdigit()]
    if "timeout" in req.query_params:
        try:
            timeout = float(req.query_params.get("timeout"))
        except ValueError:
            pass

    sanitized = sanitize_target_host(str(raw_host))
    target_host = sanitized["clean_host"]

    # Target authorization validation
    is_auth, auth_msg = is_target_authorized(target_host)
    if not is_auth:
        return {
            "host": target_host,
            "scannedCount": 0,
            "openCount": 0,
            "closedCount": 0,
            "filteredCount": 0,
            "results": [],
            "error": auth_msg,
        }

    # Validate and clean ports (Max 100 ports per scan)
    if not raw_ports:
        raw_ports = [80, 443]

    clean_ports = sorted(
        list(dict.fromkeys([p for p in raw_ports if isinstance(p, int) and 1 <= p <= 65535]))
    )[:100]

    if not clean_ports:
        clean_ports = [80, 443]

    try:
        resolved_ip = socket.gethostbyname(target_host)
    except socket.gaierror:
        resolved_ip = target_host

    timeout_sec = min(max(timeout, 0.2), 5.0)
    results = []

    # Parallel TCP socket scanning with Python sockets
    with ThreadPoolExecutor(max_workers=min(20, len(clean_ports) or 1)) as executor:
        futures = {
            executor.submit(scan_single_tcp_port, resolved_ip, port, timeout_sec): port
            for port in clean_ports
        }
        for future in as_completed(futures):
            try:
                res = future.result()
                results.append(res)
            except Exception as e:
                p = futures[future]
                results.append({
                    "port": p,
                    "status": "CLOSED",
                    "latencyMs": 0,
                    "service": WELL_KNOWN_SERVICES.get(p, {"name": f"Port {p}", "description": "", "protocol": "TCP"}),
                    "error": str(e),
                })

    results.sort(key=lambda r: r["port"])

    open_count = sum(1 for r in results if r["status"] == "OPEN")
    closed_count = sum(1 for r in results if r["status"] == "CLOSED")
    filtered_count = sum(1 for r in results if r["status"] == "FILTERED")

    return {
        "host": target_host,
        "resolvedIp": resolved_ip,
        "scannedCount": len(results),
        "openCount": open_count,
        "closedCount": closed_count,
        "filteredCount": filtered_count,
        "results": results,
    }


@app.get("/api/my-ip")
@rate_limit(max_requests=60, window_seconds=60.0)
def my_ip(req: Request):
    f = req.headers.get("x-forwarded-for")
    ip = f.split(",")[0].strip() if f else req.client.host or "127.0.0.1"
    if ip.startswith("::ffff:"):
        ip = ip[7:]
    return {"ip": ip}


@app.exception_handler(404)
def custom_404_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": f"API route '{request.url.path}' not found.",
            "available_endpoints": ["/api/scan", "/api/resolve-target", "/api/my-ip", "/api/health"],
        },
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Port Scanner FastAPI server on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
