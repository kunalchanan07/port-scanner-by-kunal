"""
Port Scanner by Kunal - FastAPI Backend
Production-ready TCP port scanner using Python socket, socket.SOCK_STREAM, and connect_ex().

Designed for deployment on Render, Railway, Fly.io, Heroku, or VPS,
and connecting to the Netlify frontend via VITE_API_BASE_URL.
"""

import os
import sys
import time
import errno
import socket
import ipaddress
from typing import List, Optional
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

from fastapi import FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

app = FastAPI(
    title="Port Scanner by Kunal - API",
    description="Professional TCP Network Scanner Backend using Python Sockets",
    version="1.0.0",
)

# CORS Middleware to allow requests from Netlify and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Netlify domains and localhost
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Comprehensive catalog of common TCP services
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
    5432: {"name": "PostgreSQL", "description": "PostgreSQL Relational Database", "protocol": "TCP"},
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
    Sanitizes raw input (URLs, schemes, port notations, search queries)
    and extracts the clean hostname or IP address.
    """
    if not raw_target:
        return {"clean_host": "localhost", "detected_port": None}

    val = raw_target.strip()

    # Browser names normalization
    lower = val.lower()
    if lower in ("google", "chrome", "safari"):
        return {"clean_host": "google.com", "detected_port": None}

    # URL protocol stripping (e.g. https://, http://)
    if "://" in val:
        try:
            parsed = urlparse(val)
            clean_host = parsed.hostname or "localhost"
            detected_port = parsed.port
            return {"clean_host": clean_host.lower(), "detected_port": detected_port}
        except Exception:
            val = val.split("://", 1)[1]

    # Strip paths, parameters, queries, and hash
    val = val.split("/")[0].split("?")[0].split("#")[0].strip()

    # Handle host:port notation
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
    Requirement 14: Restrict scanning to authorized targets and prevent
    unauthorized scanning of private/internal networks (RFC 1918).
    Allows localhost (127.0.0.1), scanme.nmap.org, and authorized public domains/IPs.
    """
    clean_host = host.lower().strip()

    # Explicit whitelist
    if clean_host in AUTHORIZED_HOSTS or clean_host.endswith(".google.com"):
        return True, "Authorized target"

    try:
        ip = ipaddress.ip_address(clean_host)
        if ip.is_loopback:
            return True, "Authorized loopback address"
        if ip.is_private:
            return False, (
                f"Scanning internal private network address ({clean_host}) is not permitted. "
                "Only localhost (127.0.0.1) or authorized diagnostic targets (scanme.nmap.org) can be scanned."
            )
        if ip.is_link_local:
            return False, "Scanning link-local addresses is restricted."
        # Public IP address - authorized for security testing
        return True, "Authorized public IP target"
    except ValueError:
        # Domain name
        if "." in clean_host and not clean_host.endswith(".local") and not clean_host.endswith(".internal"):
            return True, "Authorized public domain"
        return False, (
            f"Target '{clean_host}' is not in the authorized targets list. "
            "Please use localhost (127.0.0.1), scanme.nmap.org, or a valid public domain."
        )


def scan_single_tcp_port(ip: str, port: int, timeout_sec: float = 1.0) -> dict:
    """
    Requirement 3: Uses Python socket, socket.SOCK_STREAM, and connect_ex().
    Accurately identifies OPEN, CLOSED, and FILTERED states.
    """
    service_info = WELL_KNOWN_SERVICES.get(
        port,
        {
            "name": f"Port {port}",
            "description": "Custom or unassigned application port",
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
        # connect_ex returns 0 on success (TCP 3-way handshake established)
        result = s.connect_ex((ip, port))
        latency_ms = int((time.time() - start_time) * 1000)

        if result == 0:
            status = "OPEN"
        elif result in (errno.ECONNREFUSED, 111):
            status = "CLOSED"
            error_msg = "Connection refused (RST received from target)"
        elif result in (errno.ETIMEDOUT, 110):
            status = "FILTERED"
            error_msg = "Connection timed out (Filtered by firewall or packet drop)"
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


# Pydantic Schemas
class ScanRequest(BaseModel):
    host: Optional[str] = Field(default=None, description="Target host or IP")
    target: Optional[str] = Field(default=None, description="Alternative target field")
    ports: Optional[List[int]] = Field(default=None, description="List of ports to scan")
    timeout: Optional[float] = Field(default=1.0, ge=0.1, le=5.0, description="Socket timeout in seconds")


class ResolveRequest(BaseModel):
    host: Optional[str] = Field(default=None, description="Host to resolve")
    target: Optional[str] = Field(default=None, description="Alternative target field")


# Endpoints
@app.get("/")
def root():
    return {
        "app": "Port Scanner by Kunal",
        "status": "online",
        "engine": "Python Socket (socket.SOCK_STREAM + connect_ex)",
        "endpoints": [
            "/api/scan",
            "/api/resolve-target",
            "/api/my-ip",
            "/api/health",
            "/docs",
        ],
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Port Scanner by Kunal - FastAPI",
        "timestamp": time.time(),
    }


@app.api_route("/api/resolve-target", methods=["GET", "POST"])
@app.api_route("/api/resolve", methods=["GET", "POST"])
def resolve_target(req: Request, body: Optional[ResolveRequest] = None):
    # Support both GET (query parameters) and POST (JSON body)
    raw_target = None
    if body:
        raw_target = body.target or body.host
    if not raw_target:
        raw_target = req.query_params.get("target") or req.query_params.get("host") or "localhost"

    sanitized = sanitize_target_host(str(raw_target))
    clean_host = sanitized["clean_host"]
    detected_port = sanitized["detected_port"]

    is_auth, auth_msg = is_target_authorized(clean_host)
    if not is_auth:
        return {
            "valid": False,
            "host": clean_host,
            "error": auth_msg,
            "detectedPort": detected_port,
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
            "detectedPort": detected_port,
        }
    except socket.gaierror as e:
        if clean_host in ("localhost", "127.0.0.1"):
            return {
                "valid": True,
                "host": "localhost",
                "ip": "127.0.0.1",
                "allIps": ["127.0.0.1"],
                "version": "IPv4",
                "detectedPort": detected_port,
            }
        return {
            "valid": False,
            "host": clean_host,
            "error": f"Failed to resolve host '{clean_host}': {e}",
            "detectedPort": detected_port,
        }


@app.api_route("/api/scan", methods=["GET", "POST"])
@app.api_route("/api/port-scan", methods=["GET", "POST"])
def scan_ports_endpoint(req: Request, body: Optional[ScanRequest] = None):
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

    # Target Authorization check
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

    # Validate and deduplicate ports (Max limit: 100 ports per scan)
    if not raw_ports:
        raw_ports = [80, 443]

    clean_ports = sorted(
        list(dict.fromkeys([p for p in raw_ports if isinstance(p, int) and 1 <= p <= 65535]))
    )[:100]

    if not clean_ports:
        clean_ports = [80, 443]

    # Resolve IP once to avoid DNS overhead during parallel socket connect
    try:
        resolved_ip = socket.gethostbyname(target_host)
    except socket.gaierror:
        resolved_ip = target_host

    timeout_sec = min(max(timeout, 0.2), 5.0)
    results = []

    # Parallel TCP Socket scanning
    with ThreadPoolExecutor(max_workers=min(20, len(clean_ports) or 1)) as executor:
        future_map = {
            executor.submit(scan_single_tcp_port, resolved_ip, port, timeout_sec): port
            for port in clean_ports
        }
        for future in as_completed(future_map):
            try:
                res = future.result()
                results.append(res)
            except Exception as e:
                p = future_map[future]
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
def get_client_ip(req: Request):
    forwarded = req.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    else:
        client_ip = req.client.host if req.client else "127.0.0.1"

    if client_ip.startswith("::ffff:"):
        client_ip = client_ip[7:]

    return {"ip": client_ip}


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
