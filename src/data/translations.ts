export type Language = 'pa' | 'en' | 'hi';

export interface Translations {
  appName: string;
  appSubtitle: string;
  themeBadge: string;
  targetHostLabel: string;
  targetHostPlaceholder: string;
  detectMyIp: string;
  resolving: string;
  resolvedTo: string;
  invalidHost: string;
  recentTargets: string;
  noRecentTargets: string;
  clearRecent: string;
  portsLabel: string;
  portsPlaceholder: string;
  maxPortsNotice: string;
  timeoutLabel: string;
  timeoutFast: string;
  startScan: string;
  scanning: string;
  stopScan: string;
  clearResults: string;
  quickPresets: string;
  presetWeb: string;
  presetServer: string;
  presetDb: string;
  presetMail: string;
  presetTop20: string;
  presetCustomRange: string;
  applyRange: string;
  totalPorts: string;
  openPorts: string;
  closedPorts: string;
  filteredPorts: string;
  avgLatency: string;
  terminalOutput: string;
  resultsView: string;
  splitView: string;
  tableView: string;
  consoleView: string;
  filterAll: string;
  filterOpen: string;
  filterClosed: string;
  searchPlaceholder: string;
  statusOpen: string;
  statusClosed: string;
  statusFiltered: string;
  portHeader: string;
  statusHeader: string;
  serviceHeader: string;
  latencyHeader: string;
  actionHeader: string;
  copyHeader: string;
  pythonScriptTab: string;
  downloadPy: string;
  copyCode: string;
  copied: string;
  exportCsv: string;
  exportJson: string;
  scanComplete: string;
  readyToScan: string;
  noOpenPorts: string;
  noResultsFound: string;
  securityNotice: string;
  securityNoticeDesc: string;
  quickHosts: string;
  footerTagline: string;
  // Service lookup & Inspector keys
  serviceLookupTitle: string;
  inspectPort: string;
  lookupModalTitle: string;
  lookupModalDesc: string;
  commonSoftwareLabel: string;
  rfcStandardLabel: string;
  portRangeLabel: string;
  securityRecLabel: string;
  verificationCmdLabel: string;
  searchByServiceOrPort: string;
  lookupInstantPort: string;
  close: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: 'Port Scanner by Kunal',
    appSubtitle: 'Professional TCP Network Diagnostic Suite & Port Scanner',
    themeBadge: 'Professional Edition',
    targetHostLabel: 'Target IP Address or Hostname',
    targetHostPlaceholder: 'e.g. 192.168.1.1 or scanme.nmap.org',
    detectMyIp: 'Detect My IP',
    resolving: 'Resolving DNS...',
    resolvedTo: 'Resolved IP:',
    invalidHost: 'Please enter a valid IP address or reachable hostname',
    recentTargets: 'Recent Targets',
    noRecentTargets: 'No recent targets yet. Scanned hosts will be saved here.',
    clearRecent: 'Clear',
    portsLabel: 'Target Port Numbers',
    portsPlaceholder: 'e.g. 21, 22, 80, 443, 3306, 8080',
    maxPortsNotice: 'Max: 100 ports per scan',
    timeoutLabel: 'Socket Timeout',
    timeoutFast: 'Fast',
    startScan: 'Scan Ports',
    scanning: 'Scanning in Progress...',
    stopScan: 'Stop Scan',
    clearResults: 'Clear Results',
    quickPresets: 'Quick Presets',
    presetWeb: 'Web (80, 443, 8080)',
    presetServer: 'Server (21, 22, 25, 53, 80, 443)',
    presetDb: 'Databases (3306, 5432, 6379, 27017)',
    presetMail: 'Mail (25, 110, 143, 465, 587)',
    presetTop20: 'Top 20 Ports',
    presetCustomRange: 'Custom Range',
    applyRange: 'Apply',
    totalPorts: 'Total Ports',
    openPorts: 'Open Ports',
    closedPorts: 'Closed Ports',
    filteredPorts: 'Filtered',
    avgLatency: 'Avg Latency',
    terminalOutput: 'Live Terminal Console (Python Style)',
    resultsView: 'Scan Results & Service Analysis',
    splitView: 'Split View',
    tableView: 'Table View',
    consoleView: 'Console View',
    filterAll: 'All Ports',
    filterOpen: 'Open Only',
    filterClosed: 'Closed / Filtered',
    searchPlaceholder: 'Search port number, service name (e.g. HTTP, SSH, MySQL), or category...',
    statusOpen: 'OPEN',
    statusClosed: 'CLOSED',
    statusFiltered: 'FILTERED',
    portHeader: 'Port',
    statusHeader: 'Status',
    serviceHeader: 'TCP Service & Protocol',
    latencyHeader: 'Latency',
    actionHeader: 'Security Guidance',
    copyHeader: 'Copy',
    pythonScriptTab: 'Python Script',
    downloadPy: 'Download (.py)',
    copyCode: 'Copy Code',
    copied: 'Copied!',
    exportCsv: 'Export CSV',
    exportJson: 'Export JSON',
    scanComplete: 'Scan Completed Successfully!',
    readyToScan: 'Enter a target host and port numbers, then click "Scan Ports".',
    noOpenPorts: 'No open ports detected. All tested ports are closed or firewall filtered.',
    noResultsFound: 'No results match your search filter.',
    securityNotice: 'Security & Authorized Usage Notice',
    securityNoticeDesc: 'Scan only networks and servers you own or have explicit authorization to test (e.g., localhost or scanme.nmap.org).',
    quickHosts: 'Quick Hosts:',
    footerTagline: 'Port Scanner by Kunal © 2026 • Professional Blue & Slate Theme • Real Node.js TCP Sockets',
    serviceLookupTitle: 'TCP Service Directory',
    inspectPort: 'Inspect',
    lookupModalTitle: 'Port & Service Inspector',
    lookupModalDesc: 'Lightweight TCP service identification, IANA port range classification, and security recommendations.',
    commonSoftwareLabel: 'Typical Software / Daemons',
    rfcStandardLabel: 'Standard RFC Specification',
    portRangeLabel: 'IANA Port Range',
    securityRecLabel: 'Security Analysis & Remediation',
    verificationCmdLabel: 'Verification CLI Command',
    searchByServiceOrPort: 'Type port number (e.g. 80, 22, 3306) or service name to inspect...',
    lookupInstantPort: 'Lookup Port',
    close: 'Close',
  },
  pa: {
    appName: 'ਪੋਰਟ ਸਕੈਨਰ ਬਾਈ ਕੁਨਾਲ',
    appSubtitle: 'ਪ੍ਰੋਫੈਸ਼ਨਲ TCP ਨੈੱਟਵਰਕ ਡਾਇਗਨੋਸਟਿਕ ਸੂਟ ਅਤੇ ਪੋਰਟ ਸਕੈਨਰ',
    themeBadge: 'ਪ੍ਰੋਫੈਸ਼ਨਲ ਐਡੀਸ਼ਨ',
    targetHostLabel: 'ਆਈਪੀ (IP) ਐਡਰੈੱਸ ਪਾਓ',
    targetHostPlaceholder: 'ਉਦਾਹਰਣ: 192.168.1.1 ਜਾਂ scanme.nmap.org',
    detectMyIp: 'ਮੇਰਾ ਆਈਪੀ ਪਤਾ ਕਰੋ',
    resolving: 'ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ...',
    resolvedTo: 'ਹੱਲ ਕੀਤਾ ਆਈਪੀ:',
    invalidHost: 'ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ IP ਐਡਰੈੱਸ ਜਾਂ ਡੋਮੇਨ ਦਰਜ ਕਰੋ',
    recentTargets: 'ਹਾਲੀਆ ਟਾਰਗੇਟ (Recent Targets)',
    noRecentTargets: 'ਕੋਈ ਹਾਲੀਆ ਟਾਰਗੇਟ ਨਹੀਂ ਹੈ।',
    clearRecent: 'ਸਾਫ਼ ਕਰੋ',
    portsLabel: 'ਪੋਰਟ ਨੰਬਰ ਪਾਓ',
    portsPlaceholder: 'ਉਦਾਹਰਣ: 21, 22, 80, 443, 3306, 8080',
    maxPortsNotice: 'ਵੱਧ ਤੋਂ ਵੱਧ: 100 ਪੋਰਟ',
    timeoutLabel: 'ਟਾਈਮਆਊਟ',
    timeoutFast: 'ਤੇਜ਼',
    startScan: 'ਪੋਰਟ ਡਿਟੈਕਟ ਕਰੋ',
    scanning: 'ਸਕੈਨਿੰਗ ਜਾਰੀ ਹੈ...',
    stopScan: 'ਰੋਕੋ',
    clearResults: 'ਨਤੀਜੇ ਸਾਫ਼ ਕਰੋ',
    quickPresets: 'ਤੁਰੰਤ ਪ੍ਰੀਸੈੱਟ',
    presetWeb: 'ਵੈੱਬ (80, 443, 8080)',
    presetServer: 'ਸਰਵਰ (21, 22, 25, 53, 80, 443)',
    presetDb: 'ਡਾਟਾਬੇਸ (3306, 5432, 6379, 27017)',
    presetMail: 'ਮੇਲ (25, 110, 143, 465, 587)',
    presetTop20: 'ਟੌਪ 20 ਪੋਰਟ',
    presetCustomRange: 'ਰੇਂਜ ਚੁਣੋ',
    applyRange: 'ਲਾਗੂ ਕਰੋ',
    totalPorts: 'ਕੁੱਲ ਪੋਰਟ',
    openPorts: 'ਓਪਨ ਪੋਰਟ',
    closedPorts: 'ਬੰਦ ਪੋਰਟ',
    filteredPorts: 'ਫਿਲਟਰਡ',
    avgLatency: 'ਔਸਤ ਲੇਟੈਂਸੀ',
    terminalOutput: 'ਲਾਈਵ ਕੰਸੋਲ (ਪਾਈਥਨ ਸਟਾਈਲ)',
    resultsView: 'ਸਕੈਨ ਨਤੀਜੇ ਅਤੇ ਸਰਵਿਸ ਵਿਸ਼ਲੇਸ਼ਣ',
    splitView: 'ਸਪਲਿਟ ਵਿਊ',
    tableView: 'ਟੇਬਲ ਵਿਊ',
    consoleView: 'ਕੰਸੋਲ ਵਿਊ',
    filterAll: 'ਸਾਰੇ ਪੋਰਟ',
    filterOpen: 'ਸਿਰਫ਼ ਓਪਨ',
    filterClosed: 'ਸਿਰਫ਼ ਬੰਦ',
    searchPlaceholder: 'ਪੋਰਟ ਨੰਬਰ, ਸਰਵਿਸ ਦਾ ਨਾਮ (ਜਿਵੇਂ HTTP, SSH, MySQL) ਲੱਭੋ...',
    statusOpen: 'ਓਪਨ [OPEN]',
    statusClosed: 'ਬੰਦ [CLOSED]',
    statusFiltered: 'ਫਿਲਟਰਡ [FILTERED]',
    portHeader: 'ਪੋਰਟ',
    statusHeader: 'ਸਥਿਤੀ',
    serviceHeader: 'TCP ਸਰਵਿਸ ਅਤੇ ਪ੍ਰੋਟੋਕੋਲ',
    latencyHeader: 'ਲੇਟੈਂਸੀ',
    actionHeader: 'ਸੁਰੱਖਿਆ ਸੁਝਾਅ',
    copyHeader: 'ਕਾਪੀ',
    pythonScriptTab: 'ਪਾਈਥਨ ਸਕ੍ਰਿਪਟ',
    downloadPy: 'ਡਾਊਨਲੋਡ (.py)',
    copyCode: 'ਕੋਡ ਕਾਪੀ ਕਰੋ',
    copied: 'ਕਾਪੀ ਹੋ ਗਿਆ!',
    exportCsv: 'CSV ਐਕਸਪੋਰਟ',
    exportJson: 'JSON ਐਕਸਪੋਰਟ',
    scanComplete: 'ਸਕੈਨ ਮੁਕੰਮਲ ਹੋ ਗਿਆ!',
    readyToScan: 'ਕੋਈ ਸਕੈਨ ਸ਼ੁਰੂ ਕਰਨ ਲਈ IP ਅਤੇ ਪੋਰਟ ਭਰੋ ਅਤੇ "ਪੋਰਟ ਡਿਟੈਕਟ ਕਰੋ" ਬਟਨ ਦਬਾਓ।',
    noOpenPorts: 'ਕੋਈ ਓਪਨ ਪੋਰਟ ਨਹੀਂ ਮਿਲਿਆ।',
    noResultsFound: 'ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ।',
    securityNotice: 'ਸੁਰੱਖਿਆ ਨੋਟਿਸ',
    securityNoticeDesc: 'ਸਿਰਫ਼ ਆਪਣੇ ਅਧਿਕਾਰਤ ਨੈੱਟਵਰਕਾਂ ਜਾਂ ਟੈਸਟ ਸਰਵਰਾਂ (ਜਿਵੇਂ ਕਿ scanme.nmap.org) ਨੂੰ ਸਕੈਨ ਕਰੋ।',
    quickHosts: 'ਟੈਸਟ ਹੋਸਟ:',
    footerTagline: 'ਪੋਰਟ ਸਕੈਨਰ ਬਾਈ ਕੁਨਾਲ © 2026 • ਪ੍ਰੋਫੈਸ਼ਨਲ ਬਲੂ ਥੀਮ • ਅਸਲੀ TCP ਸਾਕਟ ਇੰਜਣ',
    serviceLookupTitle: 'TCP ਸਰਵਿਸ ਲੁੱਕਅੱਪ',
    inspectPort: 'ਜਾਂਚੋ',
    lookupModalTitle: 'ਪੋਰਟ ਅਤੇ ਸਰਵਿਸ ਇੰਸਪੈਕਟਰ',
    lookupModalDesc: 'ਆਮ TCP ਸਰਵਿਸਾਂ ਦੇ ਨਾਮ, IANA ਸਟੈਂਡਰਡ ਅਤੇ ਸੁਰੱਖਿਆ ਸੁਝਾਅ ਵੇਖੋ।',
    commonSoftwareLabel: 'ਆਮ ਸਾਫਟਵੇਅਰ',
    rfcStandardLabel: 'RFC ਸਟੈਂਡਰਡ',
    portRangeLabel: 'IANA ਪੋਰਟ ਰੇਂਜ',
    securityRecLabel: 'ਸੁਰੱਖਿਆ ਵਿਸ਼ਲੇਸ਼ਣ',
    verificationCmdLabel: 'ਟੈਸਟ ਕਮਾਂਡ',
    searchByServiceOrPort: 'ਪੋਰਟ ਨੰਬਰ (ਜਿਵੇਂ 80, 22, 3306) ਜਾਂ ਸਰਵਿਸ ਨਾਮ ਲਿਖੋ...',
    lookupInstantPort: 'ਵੇਖੋ',
    close: 'ਬੰਦ ਕਰੋ',
  },
  hi: {
    appName: 'पोर्ट स्कैनर बाय कुणाल',
    appSubtitle: 'प्रोफेशनल TCP नेटवर्क डायग्नोस्टिक सुइट और पोर्ट स्कैनर',
    themeBadge: 'प्रोफेशनल एडिशन',
    targetHostLabel: 'टारगेट IP एड्रेस या होस्टनेम',
    targetHostPlaceholder: 'उदा: 192.168.1.1 या scanme.nmap.org',
    detectMyIp: 'मेरा IP पता करें',
    resolving: 'DNS जांच हो रही है...',
    resolvedTo: 'सत्यापित IP:',
    invalidHost: 'कृपया एक मान्य IP एड्रेस या होस्टनेम दर्ज करें',
    recentTargets: 'हाल के टारगेट (Recent Targets)',
    noRecentTargets: 'कोई हालिया टारगेट नहीं है।',
    clearRecent: 'हटाएं',
    portsLabel: 'पोर्ट नंबर दर्ज करें',
    portsPlaceholder: 'उदा: 21, 22, 80, 443, 3306, 8080',
    maxPortsNotice: 'अधिकतम: 100 पोर्ट',
    timeoutLabel: 'सॉकेट टाइमआउट',
    timeoutFast: 'तेज़',
    startScan: 'पोर्ट स्कैन करें',
    scanning: 'स्कैनिंग जारी है...',
    stopScan: 'रोकें',
    clearResults: 'परिणाम साफ़ करें',
    quickPresets: 'त्वरित प्रीसेट',
    presetWeb: 'वेब (80, 443, 8080)',
    presetServer: 'सर्वर (21, 22, 25, 53, 80, 443)',
    presetDb: 'डेटाबेस (3306, 5432, 6379, 27017)',
    presetMail: 'मेल (25, 110, 143, 465, 587)',
    presetTop20: 'शीर्ष 20 पोर्ट',
    presetCustomRange: 'कस्टम रेंज',
    applyRange: 'लागू करें',
    totalPorts: 'कुल पोर्ट',
    openPorts: 'ओपन पोर्ट',
    closedPorts: 'क्लोज्ड पोर्ट',
    filteredPorts: 'फ़िल्टर किए गए',
    avgLatency: 'औसत विलंबता',
    terminalOutput: 'लाइव कंसोल (पायथन स्टाइल)',
    resultsView: 'स्कैन परिणाम और सर्विस विश्लेषण',
    splitView: 'स्प्लिट व्यू',
    tableView: 'टेबल व्यू',
    consoleView: 'कंसोल व्यू',
    filterAll: 'सभी पोर्ट',
    filterOpen: 'केवल ओपन',
    filterClosed: 'केवल क्लोज्ड',
    searchPlaceholder: 'पोर्ट नंबर, सर्विस का नाम (उदा: HTTP, SSH, MySQL) खोजें...',
    statusOpen: 'ओपन [OPEN]',
    statusClosed: 'क्लोज्ड [CLOSED]',
    statusFiltered: 'फ़िल्टर्ड [FILTERED]',
    portHeader: 'पोर्ट',
    statusHeader: 'स्थिति',
    serviceHeader: 'TCP सर्विस और प्रोटोकॉल',
    latencyHeader: 'विलंबता',
    actionHeader: 'सुरक्षा मार्गदर्शन',
    copyHeader: 'कॉपी',
    pythonScriptTab: 'पायथन स्क्रिप्ट',
    downloadPy: 'डाउनलोड (.py)',
    copyCode: 'कोड कॉपी करें',
    copied: 'कॉपी हो गया!',
    exportCsv: 'CSV निर्यात',
    exportJson: 'JSON निर्यात',
    scanComplete: 'स्कैन सफलतापूर्वक पूरा हुआ!',
    readyToScan: 'स्कैन शुरू करने के लिए IP और पोर्ट नंबर दर्ज करें।',
    noOpenPorts: 'कोई खुला पोर्ट नहीं मिला।',
    noResultsFound: 'कोई परिणाम नहीं मिला।',
    securityNotice: 'सुरक्षा सूचना',
    securityNoticeDesc: 'केवल अधिकृत नेटवर्क या परीक्षण सर्वर (जैसे scanme.nmap.org) को ही स्कैन करें।',
    quickHosts: 'क्विक होस्ट्स:',
    footerTagline: 'पोर्ट स्कैनर बाय कुणाल © 2026 • प्रोफेशनल ब्लू थीम • रियल TCP सॉकेट इंजन',
    serviceLookupTitle: 'TCP सर्विस डायरेक्टरी',
    inspectPort: 'निरीक्षण',
    lookupModalTitle: 'पोर्ट और सर्विस इंस्पेक्टर',
    lookupModalDesc: 'सामान्य TCP सेवाओं के नाम, IANA मानक और सुरक्षा अनुशंसाएं देखें।',
    commonSoftwareLabel: 'प्रमुख सॉफ्टवेयर',
    rfcStandardLabel: 'RFC मानक',
    portRangeLabel: 'IANA पोर्ट रेंज',
    securityRecLabel: 'सुरक्षा विश्लेषण',
    verificationCmdLabel: 'सत्यापन कमांड',
    searchByServiceOrPort: 'पोर्ट नंबर (उदा: 80, 22, 3306) या सर्विस नाम दर्ज करें...',
    lookupInstantPort: 'खोजें',
    close: 'बंद करें',
  },
};
