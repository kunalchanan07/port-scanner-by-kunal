import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2, BookOpen } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

const PYTHON_SCRIPT_CODE = `import socket
import ipaddress

def scan_port(host, port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(1)

    try:
        result = s.connect_ex((host, port))

        if result == 0:
            print(f"[OPEN] Port {port}")
        else:
            print(f"[CLOSED/FILTERED] Port {port}")

    except socket.gaierror:
        print("Invalid hostname")

    except OSError as e:
        print(f"Error on port {port}: {e}")

    finally:
        s.close()


def main():
    print("===== BASIC PORT SCANNER =====")

    host = input("Enter target IP address: ").strip()

    try:
        ipaddress.ip_address(host)
    except ValueError:
        print("Please enter a valid IP address.")
        return

    ports_input = input(
        "Enter ports separated by commas (example: 22,80,443): "
    )

    try:
        ports = list(dict.fromkeys(
            int(p.strip()) for p in ports_input.split(",")
        ))

        if not ports or any(p < 1 or p > 65535 for p in ports):
            print("Ports must be between 1 and 65535.")
            return

    except ValueError:
        print("Enter valid port numbers separated by commas.")
        return

    print(f"\\nScanning {host}...\\n")

    for port in ports:
        scan_port(host, port)

    print("\\n===== SCAN COMPLETE =====")


if __name__ == "__main__":
    main()`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-blue-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
                <span>{t.pythonScriptTab}</span>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-mono font-bold text-blue-700">
                  port_scanner.py
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {currentLang === 'pa'
                  ? 'ਤੁਹਾਡਾ ਅਸਲੀ ਪਾਈਥਨ ਸਾਕਟ ਕੋਡ'
                  : 'Original Python TCP socket port scanner script'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 transition shadow-2xs"
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
              className="rounded-xl p-2 text-slate-400 hover:bg-blue-100 hover:text-slate-700 transition ml-2"
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
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 font-sans text-xs text-blue-950 space-y-2">
            <h4 className="flex items-center gap-1.5 font-bold text-blue-900">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>
                {currentLang === 'pa'
                  ? 'ਕੋਡ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ? (ਵੇਰਵਾ)'
                  : 'How This Socket Code Works'}
              </span>
            </h4>
            <div className="grid gap-2 text-slate-600 leading-relaxed sm:grid-cols-3 pt-1">
              <div className="rounded-xl border border-blue-100 bg-white p-3">
                <span className="font-bold text-blue-950 block mb-1">
                  1. TCP Socket (`SOCK_STREAM`)
                </span>
                <span>
                  Creates a standard stream socket communicating over IPv4 TCP stack to test handshake.
                </span>
              </div>
              <div className="rounded-xl border border-blue-100 bg-white p-3">
                <span className="font-bold text-blue-950 block mb-1">
                  2. Connection Test (`connect_ex`)
                </span>
                <span>
                  Returns `0` on successful SYN-ACK handshake (Open Port), or error code (Closed/Filtered).
                </span>
              </div>
              <div className="rounded-xl border border-blue-100 bg-white p-3">
                <span className="font-bold text-blue-950 block mb-1">
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
