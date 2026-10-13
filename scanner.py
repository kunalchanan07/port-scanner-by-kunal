#!/usr/bin/env python3
"""
Port Scanner by Kunal - Backend Engine
TCP Port Scanning using Python Sockets with concurrency, timeout management,
and target authorization validation.
"""

import sys
import os
import json
import time
import errno
import socket
import argparse
import ipaddress
from concurrent.futures import ThreadPoolExecutor, as_completed
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Well-known TCP port service catalog
WELL_KNOWN_SERVICES = {
    20: {"name": "FTP-DATA", "description": "File Transfer Protocol Data Channel", "protocol": "TCP"},
    21: {"name": "FTP", "description": "File Transfer Protocol Control/Auth", "protocol": "TCP"},
    22: {"name": "SSH", "description": "Secure Shell & SFTP Remote Login", "protocol": "TCP"},
    23: {"name": "Telnet", "description": "Unencrypted Remote Terminal", "protocol": "TCP"},
    25: {"name": "SMTP", "description": "Simple Mail Transfer Protocol", "protocol": "TCP"},
    53: {"name": "DNS", "description": "Domain Name System Resolution", "protocol": "TCP/UDP"},
    80: {"name": "HTTP", "description": "HyperText Transfer Protocol (Web)", "protocol": "TCP"},
    110: {"name": "POP3", "description": "Post Office Protocol v3 (Mail)", "protocol": "TCP"},
    143: {"name": "IMAP", "description": "Internet Message Access Protocol", "protocol": "TCP"},
    443: {"name": "HTTPS", "description": "HTTP Secure (TLS/SSL Encrypted)", "protocol": "TCP"},
    445: {"name": "SMB", "description": "Microsoft Directory / SMB File Sharing", "protocol": "TCP"},
    465: {"name": "SMTPS", "description": "Secure SMTP over SSL", "protocol": "TCP"},
    587: {"name": "Submission", "description": "Email Submission with STARTTLS", "protocol": "TCP"},
    993: {"name": "IMAPS", "description": "Secure IMAP over SSL/TLS", "protocol": "TCP"},
    995: {"name": "POP3S", "description": "Secure POP3 over SSL/TLS", "protocol": "TCP"},
    1433: {"name": "MSSQL", "description": "Microsoft SQL Server Database", "protocol": "TCP"},
    1521: {"name": "Oracle-DB", "description": "Oracle Database Listener", "protocol": "TCP"},
    2082: {"name": "cPanel", "description": "cPanel Web Hosting Management", "protocol": "TCP"},
    2083: {"name": "cPanel-SSL", "description": "cPanel Web Hosting Management (SSL)", "protocol": "TCP"},
    3000: {"name": "Dev-Server", "description": "Node.js / React Dev Web Port", "protocol": "TCP"},
    3306: {"name": "MySQL", "description": "MySQL / MariaDB Database Server", "protocol": "TCP"},
    3389: {"name": "RDP", "description": "Remote Desktop Protocol (Windows)", "protocol": "TCP"},
    5000: {"name": "Flask/Dev", "description": "Python Flask Development Server", "protocol": "TCP"},
    5432: {"name": "PostgreSQL", "description": "PostgreSQL Relational Database", "protocol": "TCP"},
    6379: {"name": "Redis", "description": "Redis In-Memory Key-Value Store", "protocol": "TCP"},
    8000: {"name": "HTTP-Alt", "description": "Alternative HTTP / Django / FastAPI", "protocol": "TCP"},
    8080: {"name": "HTTP-Proxy", "description": "Alternative HTTP / Tomcat Proxy", "protocol": "TCP"},
    8443: {"name": "HTTPS-Alt", "description": "Alternative HTTPS SSL Port", "protocol": "TCP"},
    8888: {"name": "Jupyter", "description": "Jupyter Notebook Server", "protocol": "TCP"},
    9000: {"name": "SonarQube/PHP", "description": "SonarQube / PHP FastCGI", "protocol": "TCP"},
    27017: {"name": "MongoDB", "description": "MongoDB NoSQL Document Database", "protocol": "TCP"},
}

# Explicitly authorized targets list
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


def sanitize_target(raw_target: str) -> dict:
    """
    Sanitizes raw input (URLs, host:port, protocols, Chrome/Safari search strings)
    and extracts the clean hostname or IP.
    """
    if not raw_target:
        return {"clean_host": "localhost", "detected_port": None}

    val = raw_target.strip()

    # Browser names normalization
    lower = val.lower()
    if lower in ("google", "chrome", "safari"):
        return {"clean_host": "google.com", "detected_port": None}

    # URL protocol stripping (e.g. http://, https://)
    if "://" in val:
        try:
            parsed = urlparse(val)
            clean_host = parsed.hostname or "localhost"
            detected_port = parsed.port
            return {"clean_host": clean_host.lower(), "detected_port": detected_port}
        except Exception:
            val = val.split("://", 1)[1]

    # Strip paths and queries
    val = val.split("/")[0].split("?")[0].split("#")[0].strip()

    # host:port check
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
    Validates whether the target host is authorized for scanning.
    Allows localhost, 127.0.0.1, scanme.nmap.org, and authorized public domains.
    Blocks unauthorized private subnet scanning (RFC 1918) unless localhost.
    """
    clean_host = host.lower()

    if clean_host in AUTHORIZED_HOSTS or clean_host.endswith(".google.com"):
        return True, "Authorized target"

    try:
        ip = ipaddress.ip_address(clean_host)
        if ip.is_loopback:
            return True, "Authorized loopback address"
        if ip.is_private:
            return False, f"Scanning private network address {clean_host} is not permitted. Only localhost/127.0.0.1 or authorized hosts are permitted."
        # Public IP address - authorized for network diagnostics
        return True, "Authorized public IP target"
    except ValueError:
        # Hostname: Allow valid domain names
        if "." in clean_host and not clean_host.endswith(".local") and not clean_host.endswith(".internal"):
            return True, "Authorized domain"
        return False, f"Target '{clean_host}' is not in the authorized targets list. Use localhost, 127.0.0.1, scanme.nmap.org, or a valid public domain."


def resolve_host(host: str) -> dict:
    """
    Resolves hostname using socket.getaddrinfo and validates target authorization.
    """
    clean_info = sanitize_target(host)
    clean_host = clean_info["clean_host"]
    detected_port = clean_info["detected_port"]

    is_auth, auth_msg = is_target_authorized(clean_host)
    if not is_auth:
        return {
            "valid": False,
            "host": clean_host,
            "error": auth_msg,
            "detected_port": detected_port,
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
            "all_ips": ips,
            "version": version,
            "detected_port": detected_port,
        }
    except socket.gaierror as e:
        # Fallback for localhost or offline resolution
        if clean_host in ("localhost", "127.0.0.1"):
            return {
                "valid": True,
                "host": "localhost",
                "ip": "127.0.0.1",
                "all_ips": ["127.0.0.1"],
                "version": "IPv4",
                "detected_port": detected_port,
            }
        return {
            "valid": False,
            "host": clean_host,
            "error": f"Failed to resolve host '{clean_host}': {e}",
            "detected_port": detected_port,
        }


def scan_single_port(host: str, port: int, timeout_sec: float = 1.0) -> dict:
    """
    Scans a single TCP port using Python socket.connect_ex.
    Measures latency and returns standard JSON-compatible dictionary.
    """
    service_info = WELL_KNOWN_SERVICES.get(
        port,
        {
            "name": f"Port {port}",
            "description": "Custom or unregistered port",
            "protocol": "TCP",
        },
    )

    is_auth, auth_msg = is_target_authorized(host)
    if not is_auth:
        return {
            "port": port,
            "status": "CLOSED",
            "latencyMs": 0,
            "service": service_info,
            "error": auth_msg,
        }

    # Resolve family (IPv4 or IPv6)
    family = socket.AF_INET6 if ":" in host else socket.AF_INET
    s = socket.socket(family, socket.SOCK_STREAM)
    s.settimeout(timeout_sec)

    start_time = time.time()
    status = "CLOSED"
    error_msg = None

    try:
        result = s.connect_ex((host, port))
        latency_ms = int((time.time() - start_time) * 1000)

        if result == 0:
            status = "OPEN"
        elif result in (errno.ECONNREFUSED, 111):
            status = "CLOSED"
            error_msg = "Connection refused (RST received)"
        elif result in (errno.ETIMEDOUT, 110):
            status = "FILTERED"
            error_msg = "Connection timed out"
        elif result in (errno.EHOSTUNREACH, errno.ENETUNREACH, 113, 101):
            status = "FILTERED"
            error_msg = "Host or network unreachable"
        else:
            status = "CLOSED"
            error_msg = f"Socket error code {result}"
    except socket.timeout:
        latency_ms = int((time.time() - start_time) * 1000)
        status = "FILTERED"
        error_msg = "Socket connection timed out"
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


def scan_ports(host: str, ports: list[int], timeout_sec: float = 1.0, max_workers: int = 20) -> dict:
    """
    Scans a list of ports concurrently using ThreadPoolExecutor.
    """
    clean_info = sanitize_target(host)
    target_host = clean_info["clean_host"]

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

    # Resolve IP address first to prevent repeated DNS lookups
    try:
        resolved_ip = socket.gethostbyname(target_host)
    except socket.gaierror:
        resolved_ip = target_host

    results = []
    # Deduplicate and sort ports, limiting to 100
    unique_ports = sorted(list(dict.fromkeys([p for p in ports if 1 <= p <= 65535])))[:100]

    with ThreadPoolExecutor(max_workers=min(max_workers, len(unique_ports) or 1)) as executor:
        future_to_port = {
            executor.submit(scan_single_port, resolved_ip, port, timeout_sec): port
            for port in unique_ports
        }
        for future in as_completed(future_to_port):
            try:
                res = future.result()
                results.append(res)
            except Exception as e:
                p = future_to_port[future]
                results.append({
                    "port": p,
                    "status": "CLOSED",
                    "latencyMs": 0,
                    "service": WELL_KNOWN_SERVICES.get(p, {"name": f"Port {p}", "description": "", "protocol": "TCP"}),
                    "error": str(e),
                })

    # Sort results by port number
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


class PortScannerHTTPHandler(BaseHTTPRequestHandler):
    """
    HTTP Request Handler providing REST API endpoints with valid JSON responses.
    Never returns 404 HTML.
    """

    def _set_json_headers(self, status_code: int = 200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_json_headers(200)

    def _read_body_json(self) -> dict:
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            body_bytes = self.rfile.read(content_length)
            try:
                return json.loads(body_bytes.decode("utf-8"))
            except Exception:
                return {}
        return {}

    def do_GET(self):
        self._handle_request("GET")

    def do_POST(self):
        self._handle_request("POST")

    def _handle_request(self, method: str):
        parsed_url = urlparse(self.path)
        path = parsed_url.path.rstrip("/")
        query = parse_qs(parsed_url.query)
        body = self._read_body_json() if method == "POST" else {}

        # 1. Resolve Target
        if path in ("/api/resolve-target", "/api/resolve"):
            raw_target = (
                body.get("target")
                or (query.get("target", [None])[0])
                or body.get("host")
                or (query.get("host", [None])[0])
                or "localhost"
            )
            res = resolve_host(str(raw_target))
            self._set_json_headers(200)
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        # 2. Port Scanning
        if path in ("/api/scan", "/api/port-scan", "/api/ports"):
            raw_host = (
                body.get("host")
                or (query.get("host", [None])[0])
                or "localhost"
            )
            raw_ports = (
                body.get("ports")
                or (query.get("ports", [None])[0])
                or [80, 443]
            )
            timeout = float(
                body.get("timeout")
                or (query.get("timeout", [1.0])[0])
                or 1.0
            )

            if isinstance(raw_ports, str):
                ports_list = [int(p.strip()) for p in raw_ports.split(",") if p.strip().isdigit()]
            elif isinstance(raw_ports, list):
                ports_list = [int(p) for p in raw_ports if str(p).isdigit()]
            else:
                ports_list = [80, 443]

            res = scan_ports(str(raw_host), ports_list, timeout_sec=min(timeout, 5.0))
            self._set_json_headers(200)
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        # 3. Client IP helper
        if path in ("/api/my-ip", "/api/ip"):
            client_ip = self.client_address[0]
            self._set_json_headers(200)
            self.wfile.write(json.dumps({"ip": client_ip}).encode("utf-8"))
            return

        # 4. Port service lookup
        if path.startswith("/api/port-lookup/"):
            try:
                port_num = int(path.split("/")[-1])
                service = WELL_KNOWN_SERVICES.get(port_num, {
                    "name": f"Port {port_num}",
                    "description": "Custom or unassigned port",
                    "protocol": "TCP",
                })
                self._set_json_headers(200)
                self.wfile.write(json.dumps({"port": port_num, **service}).encode("utf-8"))
            except ValueError:
                self._set_json_headers(400)
                self.wfile.write(json.dumps({"error": "Invalid port number"}).encode("utf-8"))
            return

        # Default fallback: Valid JSON response for any other route (never 404 HTML)
        self._set_json_headers(404)
        self.wfile.write(json.dumps({
            "error": f"API route '{path}' not found.",
            "status": 404,
            "available_routes": [
                "/api/resolve-target",
                "/api/scan",
                "/api/my-ip",
                "/api/port-lookup/<port>",
            ],
        }).encode("utf-8"))

    def log_message(self, format, *args):
        # Quiet standard HTTP server logs to stdout
        pass


def run_http_server(host="0.0.0.0", port=5000):
    server = HTTPServer((host, port), PortScannerHTTPHandler)
    print(f"Port Scanner Python Backend Server running on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()


def main():
    parser = argparse.ArgumentParser(description="Port Scanner by Kunal - Python TCP Socket Scanner")
    parser.add_argument("--host", default="localhost", help="Target hostname or IP (default: localhost)")
    parser.add_argument("--ports", default="80,443", help="Comma-separated list of ports (default: 80,443)")
    parser.add_argument("--timeout", type=float, default=1.0, help="Socket timeout in seconds (default: 1.0)")
    parser.add_argument("--resolve", action="store_true", help="Resolve and validate target only")
    parser.add_argument("--server", action="store_true", help="Start HTTP JSON API server")
    parser.add_argument("--port", type=int, default=5000, help="HTTP server port (default: 5000)")

    args = parser.parse_args()

    if args.server:
        run_http_server(port=args.port)
        return

    if args.resolve:
        result = resolve_host(args.host)
        print(json.dumps(result, indent=2))
        return

    ports_list = [int(p.strip()) for p in args.ports.split(",") if p.strip().isdigit()]
    result = scan_ports(args.host, ports_list, timeout_sec=args.timeout)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
