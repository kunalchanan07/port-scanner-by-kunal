import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import net from 'net';
import dns from 'dns/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Well known port mapping service dictionary
// Comprehensive well known TCP port mapping service dictionary
const WELL_KNOWN_SERVICES: Record<number, { name: string; description: string; protocol: string; category?: string }> = {
  20: { name: 'FTP-DATA', description: 'File Transfer Protocol Data Channel', protocol: 'TCP', category: 'system' },
  21: { name: 'FTP', description: 'File Transfer Protocol Control/Auth', protocol: 'TCP', category: 'system' },
  22: { name: 'SSH', description: 'Secure Shell & SFTP Remote Login', protocol: 'TCP', category: 'remote' },
  23: { name: 'Telnet', description: 'Unencrypted Remote Terminal', protocol: 'TCP', category: 'remote' },
  25: { name: 'SMTP', description: 'Simple Mail Transfer Protocol', protocol: 'TCP', category: 'mail' },
  43: { name: 'WHOIS', description: 'WHOIS Domain Registration Directory', protocol: 'TCP', category: 'system' },
  53: { name: 'DNS', description: 'Domain Name System Resolution', protocol: 'TCP/UDP', category: 'system' },
  67: { name: 'DHCP-Server', description: 'Dynamic Host Configuration Server', protocol: 'UDP', category: 'system' },
  68: { name: 'DHCP-Client', description: 'Dynamic Host Configuration Client', protocol: 'UDP', category: 'system' },
  69: { name: 'TFTP', description: 'Trivial File Transfer Protocol', protocol: 'UDP', category: 'system' },
  80: { name: 'HTTP', description: 'HyperText Transfer Protocol (Web)', protocol: 'TCP', category: 'web' },
  88: { name: 'Kerberos', description: 'Kerberos Network Authentication', protocol: 'TCP/UDP', category: 'security' },
  110: { name: 'POP3', description: 'Post Office Protocol v3 (Mail Retrieval)', protocol: 'TCP', category: 'mail' },
  111: { name: 'RPCbind', description: 'Sun RPC Portmapper', protocol: 'TCP/UDP', category: 'system' },
  119: { name: 'NNTP', description: 'Network News Transfer Protocol', protocol: 'TCP', category: 'other' },
  123: { name: 'NTP', description: 'Network Time Protocol Clock Sync', protocol: 'UDP', category: 'system' },
  135: { name: 'MS-RPC', description: 'Microsoft RPC Endpoint Mapper', protocol: 'TCP', category: 'system' },
  137: { name: 'NetBIOS-NS', description: 'NetBIOS Name Service', protocol: 'UDP', category: 'system' },
  139: { name: 'NetBIOS-SSN', description: 'NetBIOS Session Service (Windows Sharing)', protocol: 'TCP', category: 'system' },
  143: { name: 'IMAP', description: 'Internet Message Access Protocol', protocol: 'TCP', category: 'mail' },
  161: { name: 'SNMP', description: 'Simple Network Management Protocol', protocol: 'UDP', category: 'system' },
  194: { name: 'IRC', description: 'Internet Relay Chat', protocol: 'TCP', category: 'other' },
  389: { name: 'LDAP', description: 'Lightweight Directory Access Protocol', protocol: 'TCP/UDP', category: 'security' },
  443: { name: 'HTTPS', description: 'HTTP Secure (TLS/SSL Encrypted Web)', protocol: 'TCP', category: 'web' },
  445: { name: 'SMB', description: 'Microsoft Directory / SMB File Sharing', protocol: 'TCP', category: 'system' },
  465: { name: 'SMTPS', description: 'Secure Simple Mail Transfer (SSL)', protocol: 'TCP', category: 'mail' },
  500: { name: 'IPsec IKE', description: 'Internet Key Exchange VPN', protocol: 'UDP', category: 'security' },
  514: { name: 'Syslog', description: 'System Logging Daemon', protocol: 'UDP/TCP', category: 'system' },
  587: { name: 'Submission', description: 'Email Message Submission (STARTTLS)', protocol: 'TCP', category: 'mail' },
  636: { name: 'LDAPS', description: 'Secure LDAP over TLS', protocol: 'TCP', category: 'security' },
  873: { name: 'Rsync', description: 'Remote Sync File Daemon', protocol: 'TCP', category: 'system' },
  993: { name: 'IMAPS', description: 'Secure IMAP over SSL/TLS', protocol: 'TCP', category: 'mail' },
  995: { name: 'POP3S', description: 'Secure POP3 over SSL/TLS', protocol: 'TCP', category: 'mail' },
  1080: { name: 'SOCKS', description: 'SOCKS Proxy Protocol', protocol: 'TCP', category: 'other' },
  1194: { name: 'OpenVPN', description: 'OpenVPN Tunnel Protocol', protocol: 'UDP/TCP', category: 'security' },
  1433: { name: 'MSSQL', description: 'Microsoft SQL Server Database', protocol: 'TCP', category: 'database' },
  1434: { name: 'MSSQL-Monitor', description: 'Microsoft SQL Server Monitor', protocol: 'UDP', category: 'database' },
  1521: { name: 'Oracle-DB', description: 'Oracle Database Listener', protocol: 'TCP', category: 'database' },
  1723: { name: 'PPTP', description: 'Point-to-Point Tunneling VPN', protocol: 'TCP', category: 'security' },
  1883: { name: 'MQTT', description: 'Message Queuing Telemetry Transport', protocol: 'TCP', category: 'message' },
  2049: { name: 'NFS', description: 'Network File System', protocol: 'TCP/UDP', category: 'system' },
  2082: { name: 'cPanel', description: 'cPanel Web Hosting Management (HTTP)', protocol: 'TCP', category: 'remote' },
  2083: { name: 'cPanel-SSL', description: 'cPanel Web Hosting Management (HTTPS)', protocol: 'TCP', category: 'remote' },
  2086: { name: 'WHM', description: 'WebHost Manager (HTTP)', protocol: 'TCP', category: 'remote' },
  2087: { name: 'WHM-SSL', description: 'WebHost Manager (HTTPS)', protocol: 'TCP', category: 'remote' },
  2181: { name: 'ZooKeeper', description: 'Apache ZooKeeper Coordination', protocol: 'TCP', category: 'message' },
  2375: { name: 'Docker', description: 'Docker Daemon REST API (Plaintext)', protocol: 'TCP', category: 'dev' },
  2376: { name: 'Docker-TLS', description: 'Docker Daemon REST API (TLS Encrypted)', protocol: 'TCP', category: 'dev' },
  3000: { name: 'Dev-Server', description: 'React / Node.js Dev Web Port', protocol: 'TCP', category: 'web' },
  3128: { name: 'Squid-Proxy', description: 'Squid Caching Web Proxy', protocol: 'TCP', category: 'other' },
  3306: { name: 'MySQL', description: 'MySQL / MariaDB Database Server', protocol: 'TCP', category: 'database' },
  3389: { name: 'RDP', description: 'Remote Desktop Protocol (Windows)', protocol: 'TCP', category: 'remote' },
  3690: { name: 'SVN', description: 'Subversion Version Control', protocol: 'TCP', category: 'dev' },
  4000: { name: 'GraphQL/Dev', description: 'Apollo GraphQL / Hexo Dev Server', protocol: 'TCP', category: 'dev' },
  4200: { name: 'Angular-Dev', description: 'Angular CLI Development Server', protocol: 'TCP', category: 'dev' },
  4369: { name: 'EPMD', description: 'Erlang Port Mapper Daemon', protocol: 'TCP', category: 'message' },
  5000: { name: 'Flask/Docker', description: 'Flask Dev Server / Docker Registry', protocol: 'TCP', category: 'dev' },
  5060: { name: 'SIP', description: 'Session Initiation Protocol (VoIP)', protocol: 'UDP/TCP', category: 'other' },
  5173: { name: 'Vite-Dev', description: 'Vite Frontend Dev Server', protocol: 'TCP', category: 'dev' },
  5432: { name: 'PostgreSQL', description: 'PostgreSQL Relational Database Engine', protocol: 'TCP', category: 'database' },
  5672: { name: 'RabbitMQ', description: 'RabbitMQ AMQP Message Broker', protocol: 'TCP', category: 'message' },
  5900: { name: 'VNC', description: 'Virtual Network Computing Display', protocol: 'TCP', category: 'remote' },
  6379: { name: 'Redis', description: 'Redis In-Memory Key-Value Store', protocol: 'TCP', category: 'database' },
  6443: { name: 'K8s-API', description: 'Kubernetes API Server', protocol: 'TCP', category: 'dev' },
  7001: { name: 'WebLogic', description: 'Oracle WebLogic Application Server', protocol: 'TCP', category: 'web' },
  8000: { name: 'HTTP-Alt', description: 'Alternative HTTP / Django / FastAPI', protocol: 'TCP', category: 'web' },
  8080: { name: 'HTTP-Proxy', description: 'Alternative HTTP Web Proxy / Tomcat', protocol: 'TCP', category: 'web' },
  8081: { name: 'HTTP-Alt2', description: 'Secondary Alternative Web / Proxy', protocol: 'TCP', category: 'web' },
  8443: { name: 'HTTPS-Alt', description: 'Alternative HTTPS SSL Port', protocol: 'TCP', category: 'web' },
  8888: { name: 'Jupyter', description: 'Jupyter Notebook / Web Service', protocol: 'TCP', category: 'dev' },
  9000: { name: 'Sonar/PHP-FPM', description: 'SonarQube / PHP FastCGI Manager', protocol: 'TCP', category: 'dev' },
  9090: { name: 'Prometheus', description: 'Prometheus Monitoring Metrics', protocol: 'TCP', category: 'system' },
  9092: { name: 'Kafka', description: 'Apache Kafka Message Streaming Broker', protocol: 'TCP', category: 'message' },
  9100: { name: 'Node-Exporter', description: 'Prometheus Node Exporter', protocol: 'TCP', category: 'system' },
  9200: { name: 'Elasticsearch', description: 'Elasticsearch RESTful Search API', protocol: 'TCP', category: 'database' },
  9300: { name: 'ES-Cluster', description: 'Elasticsearch Internal Cluster Node', protocol: 'TCP', category: 'database' },
  9418: { name: 'Git', description: 'Git Version Control Daemon', protocol: 'TCP', category: 'dev' },
  10000: { name: 'Webmin', description: 'Webmin Linux System Administration', protocol: 'TCP', category: 'remote' },
  11211: { name: 'Memcached', description: 'Memcached In-Memory Cache', protocol: 'TCP/UDP', category: 'database' },
  15672: { name: 'RabbitMQ-Mgmt', description: 'RabbitMQ Management Web UI', protocol: 'TCP', category: 'message' },
  27017: { name: 'MongoDB', description: 'MongoDB NoSQL Document Database', protocol: 'TCP', category: 'database' },
  27018: { name: 'MongoDB-Shard', description: 'MongoDB Shard Daemon', protocol: 'TCP', category: 'database' },
  28017: { name: 'MongoDB-Web', description: 'MongoDB Web Console', protocol: 'TCP', category: 'database' },
  50000: { name: 'SAP', description: 'SAP NetWeaver Dispatcher', protocol: 'TCP', category: 'system' },
};

// Helper: Intelligently clean and extract domain/IP from user input or browser URLs
// Handles inputs like "https://google.com", "http://google.com/", "www.google.com", "google.com:443", "http://localhost:3000"
function sanitizeTargetHost(input: string): { cleanHost: string; detectedPort?: number; original: string } {
  const original = (input || '').trim();
  if (!original) {
    return { cleanHost: '', original: '' };
  }

  let cleaned = original;

  // Handle browser protocol prefix: https://, http://, ftp://, ws://, wss://, etc.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(cleaned)) {
    try {
      const parsed = new URL(cleaned);
      const cleanHost = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
      const detectedPort = parsed.port ? parseInt(parsed.port, 10) : undefined;
      return { cleanHost, detectedPort, original };
    } catch {
      cleaned = cleaned.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
    }
  }

  // Handle leading slashes like //google.com
  cleaned = cleaned.replace(/^\/\//, '');

  // Strip path (e.g. google.com/search?q=1 -> google.com)
  const slashIdx = cleaned.indexOf('/');
  if (slashIdx !== -1) {
    cleaned = cleaned.slice(0, slashIdx);
  }

  // Strip query and hash
  cleaned = cleaned.split('?')[0].split('#')[0].trim();

  // Handle host:port notation (e.g. google.com:443 or localhost:3000 or 127.0.0.1:8080)
  let detectedPort: number | undefined;
  if (/^[^:]+:\d+$/.test(cleaned)) {
    const parts = cleaned.split(':');
    cleaned = parts[0];
    const p = parseInt(parts[1], 10);
    if (!isNaN(p) && p >= 1 && p <= 65535) {
      detectedPort = p;
    }
  }

  // Strip IPv6 brackets if any
  cleaned = cleaned.replace(/^\[|\]$/g, '').trim().toLowerCase();

  return { cleanHost: cleaned, detectedPort, original };
}

// Resolver: Resolves hostname, Google domains, local hosts, and IPs
async function resolveTargetAddress(targetInput: string): Promise<{
  valid: boolean;
  cleanHost: string;
  ip: string;
  allIps: string[];
  version: 'IPv4' | 'IPv6';
  detectedPort?: number;
  error?: string;
}> {
  const { cleanHost, detectedPort } = sanitizeTargetHost(targetInput);

  if (!cleanHost) {
    return {
      valid: false,
      cleanHost: '',
      ip: '',
      allIps: [],
      version: 'IPv4',
      error: 'Please provide a valid target IP, domain, or URL (e.g., google.com, 127.0.0.1, or https://google.com).',
    };
  }

  // Check if directly an IP
  const isIP = net.isIP(cleanHost);
  if (isIP !== 0) {
    return {
      valid: true,
      cleanHost,
      ip: cleanHost,
      allIps: [cleanHost],
      version: isIP === 4 ? 'IPv4' : 'IPv6',
      detectedPort,
    };
  }

  // Special handle localhost
  if (cleanHost === 'localhost') {
    return {
      valid: true,
      cleanHost: 'localhost',
      ip: '127.0.0.1',
      allIps: ['127.0.0.1', '::1'],
      version: 'IPv4',
      detectedPort,
    };
  }

  // Use dns.lookup (OS getaddrinfo - exactly matching Python socket behavior)
  try {
    const lookupResults = await dns.lookup(cleanHost, { all: true });
    if (lookupResults && lookupResults.length > 0) {
      const ipv4Match = lookupResults.find((r) => r.family === 4);
      const chosen = ipv4Match || lookupResults[0];
      return {
        valid: true,
        cleanHost,
        ip: chosen.address,
        allIps: lookupResults.map((r) => r.address),
        version: chosen.family === 4 ? 'IPv4' : 'IPv6',
        detectedPort,
      };
    }
  } catch {
    // Fallback to resolve4 and resolve6
    try {
      const addresses4 = await dns.resolve4(cleanHost);
      if (addresses4 && addresses4.length > 0) {
        return {
          valid: true,
          cleanHost,
          ip: addresses4[0],
          allIps: addresses4,
          version: 'IPv4',
          detectedPort,
        };
      }
    } catch {
      try {
        const addresses6 = await dns.resolve6(cleanHost);
        if (addresses6 && addresses6.length > 0) {
          return {
            valid: true,
            cleanHost,
            ip: addresses6[0],
            allIps: addresses6,
            version: 'IPv6',
            detectedPort,
          };
        }
      } catch {
        // Failed
      }
    }
  }

  return {
    valid: false,
    cleanHost,
    ip: '',
    allIps: [],
    version: 'IPv4',
    error: `Could not resolve domain or host: "${cleanHost}". Please verify the URL or hostname.`,
  };
}

// Helper: Scan a single TCP port using real node:net Socket
// Exactly reproduces Python's socket.socket(socket.AF_INET, socket.SOCK_STREAM) + connect_ex
function testPort(rawHost: string, port: number, timeoutMs = 1200): Promise<{
  port: number;
  status: 'OPEN' | 'CLOSED' | 'FILTERED';
  latencyMs: number;
  service?: { name: string; description: string; protocol: string };
  error?: string;
}> {
  return new Promise((resolve) => {
    try {
      const { cleanHost } = sanitizeTargetHost(rawHost);
      const targetHost = cleanHost || rawHost;
      const startTime = Date.now();
      const socket = new net.Socket();
      let hasResolved = false;

      const finalize = (status: 'OPEN' | 'CLOSED' | 'FILTERED', errorMsg?: string) => {
        if (hasResolved) return;
        hasResolved = true;
        const latencyMs = Date.now() - startTime;
        try {
          socket.destroy();
        } catch {
          // Ignore socket destruction errors
        }
        resolve({
          port,
          status,
          latencyMs,
          service: WELL_KNOWN_SERVICES[port] || {
            name: `Port ${port}`,
            description: 'Custom/Unregistered Port',
            protocol: 'TCP',
          },
          error: errorMsg,
        });
      };

      socket.setTimeout(timeoutMs);

      socket.on('connect', () => {
        finalize('OPEN');
      });

      socket.on('timeout', () => {
        finalize('FILTERED', 'Connection timed out (Filtered by firewall or drop)');
      });

      socket.on('error', (err: any) => {
        // ECONNREFUSED means target host actively rejected the TCP SYN with an RST packet -> CLOSED
        // EHOSTUNREACH / ENETUNREACH means host is unreachable / filtered
        // ETIMEDOUT means dropped -> FILTERED
        if (err.code === 'ECONNREFUSED') {
          finalize('CLOSED', 'Connection refused (RST received)');
        } else if (err.code === 'ETIMEDOUT') {
          finalize('FILTERED', 'Connection timed out');
        } else if (err.code === 'EHOSTUNREACH' || err.code === 'ENETUNREACH') {
          finalize('FILTERED', 'Host/Network unreachable');
        } else {
          finalize('CLOSED', err.message || 'Connection failed');
        }
      });

      socket.connect(port, targetHost);
    } catch (err: any) {
      resolve({
        port,
        status: 'CLOSED',
        latencyMs: 0,
        service: WELL_KNOWN_SERVICES[port] || {
          name: `Port ${port}`,
          description: 'Custom/Unregistered Port',
          protocol: 'TCP',
        },
        error: err.message || 'Failed to initiate socket connection',
      });
    }
  });
}

// Endpoint to resolve hostname / check target validity (supports URLs like https://google.com)
app.post('/api/resolve-target', async (req: Request, res: Response) => {
  try {
    const { target } = req.body || {};
    if (!target || typeof target !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid host or IP address.' });
    }

    const resolution = await resolveTargetAddress(target);
    if (resolution.valid) {
      return res.json({
        valid: true,
        host: resolution.cleanHost,
        ip: resolution.ip,
        allIps: resolution.allIps,
        version: resolution.version,
        detectedPort: resolution.detectedPort,
      });
    }

    return res.status(400).json({
      valid: false,
      error: resolution.error || `Invalid hostname or could not resolve DNS: ${target}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'DNS Resolution failed' });
  }
});

// Endpoint to scan a batch of ports with concurrency control
app.post('/api/scan', async (req: Request, res: Response) => {
  try {
    const { host, ports, timeout = 1200 } = req.body || {};

    if (!host || typeof host !== 'string') {
      return res.status(400).json({ error: 'Target host is required.' });
    }

    const { cleanHost } = sanitizeTargetHost(host);
    const targetHost = cleanHost || host;

    if (!Array.isArray(ports) || ports.length === 0) {
      return res.status(400).json({ error: 'At least one port must be provided.' });
    }

    const cleanPorts: number[] = Array.from(
      new Set(
        ports
          .map((p) => parseInt(p, 10))
          .filter((p) => !isNaN(p) && p >= 1 && p <= 65535)
      )
    ).slice(0, 100);

    if (cleanPorts.length === 0) {
      return res.status(400).json({ error: 'Ports must be valid numbers between 1 and 65535.' });
    }

    const results: any[] = [];
    const concurrency = 20;
    const timeoutMs = Math.min(Math.max(Number(timeout) || 1200, 300), 5000);

    for (let i = 0; i < cleanPorts.length; i += concurrency) {
      const slice = cleanPorts.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        slice.map((p) => testPort(targetHost, p, timeoutMs))
      );
      results.push(...batchResults);
    }

    res.json({
      host: targetHost,
      scannedCount: results.length,
      openCount: results.filter((r) => r.status === 'OPEN').length,
      closedCount: results.filter((r) => r.status === 'CLOSED').length,
      filteredCount: results.filter((r) => r.status === 'FILTERED').length,
      results,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Scan execution failed' });
  }
});

// SSE Streaming scan for live terminal & live UI updates (fully compatible with Chrome, Safari, Firefox, Edge, Mobile)
app.get('/api/scan-stream', async (req: Request, res: Response) => {
  const rawHost = (req.query.host as string)?.trim();
  const portsParam = req.query.ports as string;
  const timeoutMs = Math.min(Math.max(parseInt(req.query.timeout as string, 10) || 1000, 300), 4000);

  if (!rawHost) {
    return res.status(400).json({ error: 'Host parameter is required.' });
  }

  const { cleanHost } = sanitizeTargetHost(rawHost);
  const targetHost = cleanHost || rawHost;

  const rawPorts = portsParam ? portsParam.split(',') : ['80', '443'];
  const ports = Array.from(
    new Set(
      rawPorts
        .map((p) => parseInt(p.trim(), 10))
        .filter((p) => !isNaN(p) && p >= 1 && p <= 65535)
    )
  ).slice(0, 100);

  if (ports.length === 0) {
    return res.status(400).json({ error: 'Valid ports are required.' });
  }

  // Cross-browser SSE Headers: Chrome, Safari, Firefox, Edge, Mobile
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders?.();

  // Send initial comment byte to force Safari & Chrome to immediately flush the stream buffer
  res.write(': keep-alive\n\n');

  let isAborted = false;
  req.on('close', () => {
    isAborted = true;
  });

  // Send start event
  res.write(`data: ${JSON.stringify({ type: 'start', host: targetHost, totalPorts: ports.length })}\n\n`);

  try {
    for (let i = 0; i < ports.length; i++) {
      if (isAborted) break;
      const port = ports[i];
      const result = await testPort(targetHost, port, timeoutMs);
      if (isAborted) break;
      res.write(`data: ${JSON.stringify({ type: 'result', index: i + 1, total: ports.length, result })}\n\n`);
    }

    if (!isAborted) {
      res.write(`data: ${JSON.stringify({ type: 'complete', host: targetHost })}\n\n`);
      setTimeout(() => {
        try {
          if (!res.writableEnded) {
            res.end();
          }
        } catch {
          // ignore
        }
      }, 150);
    }
  } catch (err: any) {
    if (!isAborted && !res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err?.message || 'Streaming error' })}\n\n`);
      res.end();
    }
  }
});

// Client IP detection helper
app.get('/api/my-ip', (req: Request, res: Response) => {
  const forwarded = req.headers['x-forwarded-for'];
  let ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || '127.0.0.1';
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  res.json({ ip });
});

// Lightweight TCP Port Service Lookup API
app.get('/api/port-lookup/:port', (req: Request, res: Response) => {
  const portNum = parseInt(req.params.port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return res.status(400).json({ error: 'Port must be an integer between 1 and 65535.' });
  }

  const service = WELL_KNOWN_SERVICES[portNum];
  const portRange = portNum < 1024 ? 'System (0-1023)' : portNum <= 49151 ? 'Registered (1024-49151)' : 'Dynamic (49152-65535)';

  if (service) {
    return res.json({
      port: portNum,
      isKnown: true,
      portRange,
      ...service,
    });
  }

  return res.json({
    port: portNum,
    isKnown: false,
    name: `Port ${portNum}`,
    description: 'Custom or unassigned application port',
    protocol: 'TCP',
    category: portNum < 1024 ? 'system' : 'other',
    portRange,
  });
});

// Explicit API 404 Handler - MUST come before Vite to prevent HTML falling through to JSON fetch calls
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
});

// Global API error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  if (req.path.startsWith('/api')) {
    console.error('API Error handler caught:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error occurred.' });
  }
  next(err);
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Port Scanner server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
