#!/usr/bin/env python3
"""
Port Scanner by Kunal - Standalone Python Backend Entry Point
Provides a production-ready HTTP server with TCP socket port scanning,
target validation, and JSON responses.

Usage:
  python3 app.py
  python3 app.py --port 5000
"""

import sys
import os
import argparse

# Import core scanner engine
from scanner import run_http_server, scan_ports, resolve_host, is_target_authorized


def start_flask_server(port: int = 5000):
    try:
        from flask import Flask, request, jsonify

        app = Flask(__name__)

        @app.after_request
        def add_cors_headers(response):
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            return response

        @app.route("/api/resolve-target", methods=["GET", "POST"])
        @app.route("/api/resolve", methods=["GET", "POST"])
        def resolve_endpoint():
            target = request.json.get("target") if request.is_json else None
            target = target or request.args.get("target") or request.args.get("host") or "localhost"
            res = resolve_host(str(target))
            return jsonify(res)

        @app.route("/api/scan", methods=["GET", "POST"])
        @app.route("/api/port-scan", methods=["GET", "POST"])
        def scan_endpoint():
            data = request.json if request.is_json else {}
            host = data.get("host") or request.args.get("host") or "localhost"
            ports_raw = data.get("ports") or request.args.get("ports") or [80, 443]
            timeout = float(data.get("timeout") or request.args.get("timeout") or 1.0)

            if isinstance(ports_raw, str):
                ports = [int(p.strip()) for p in ports_raw.split(",") if p.strip().isdigit()]
            elif isinstance(ports_raw, list):
                ports = [int(p) for p in ports_raw if str(p).isdigit()]
            else:
                ports = [80, 443]

            res = scan_ports(str(host), ports, timeout_sec=min(timeout, 5.0))
            return jsonify(res)

        @app.route("/api/my-ip", methods=["GET"])
        def my_ip_endpoint():
            forwarded = request.headers.get("X-Forwarded-For")
            ip = forwarded.split(",")[0].strip() if forwarded else request.remote_addr or "127.0.0.1"
            return jsonify({"ip": ip})

        @app.route("/api/health", methods=["GET"])
        def health_endpoint():
            return jsonify({"status": "ok", "backend": "Python Flask Socket Scanner"})

        @app.errorhandler(404)
        def handle_404(e):
            return jsonify({
                "status": 404,
                "error": "API route not found. Valid routes: /api/scan, /api/resolve-target, /api/my-ip",
            }), 404

        print(f"Starting Flask Port Scanner server on port {port}...")
        app.run(host="0.0.0.0", port=port, debug=False)
        return True
    except ImportError:
        return False


def main():
    parser = argparse.ArgumentParser(description="Port Scanner by Kunal - Python Backend")
    parser.add_argument("--port", type=int, default=5000, help="Port to listen on (default: 5000)")
    args = parser.parse_args()

    # Try Flask if installed, otherwise use built-in standard library HTTP server
    if not start_flask_server(args.port):
        print("Flask not installed. Using Python standard library HTTPServer...")
        run_http_server(host="0.0.0.0", port=args.port)


if __name__ == "__main__":
    main()
