import React, { useState, useRef, useEffect } from 'react';
import { Shield, Globe, ChevronDown, Check, Sun, Moon } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenPythonModal?: () => void;
  onSelectTarget: (host: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const LANGUAGES: { code: Language; label: string; nativeName: string; flag: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🌐' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', nativeName: 'ਪੰਜਾਬੀ', flag: 'ੴ' },
  { code: 'hi', label: 'हिन्दी (Hindi)', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  onOpenPythonModal,
  onSelectTarget,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xs transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand: Port Scanner by Kunal */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-600 dark:from-slate-800 dark:via-blue-800 dark:to-blue-500 p-0.5 shadow-md shadow-blue-900/10">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-900 text-white">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-950 dark:text-white font-sans sm:text-xl">
                {t.appName}
              </span>
            </div>
            <p className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 md:block max-w-md truncate">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Quick Targets & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Target Chips */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 p-1 text-xs text-slate-600 dark:text-slate-300">
            <span className="px-2 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t.quickHosts}</span>
            <button
              onClick={() => onSelectTarget('google.com')}
              className="rounded-lg px-2.5 py-1 font-semibold text-blue-700 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-2xs transition"
              title="Google Web (HTTP Ports 80 & 443)"
            >
              google.com
            </button>
            <button
              onClick={() => onSelectTarget('scanme.nmap.org')}
              className="rounded-lg px-2.5 py-1 font-semibold text-blue-700 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-2xs transition"
              title="Official Nmap authorized test host"
            >
              scanme.nmap.org
            </button>
            <button
              onClick={() => onSelectTarget('1.1.1.1')}
              className="rounded-lg px-2.5 py-1 font-semibold text-blue-700 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-2xs transition"
              title="Cloudflare DNS"
            >
              1.1.1.1
            </button>
            <button
              onClick={() => onSelectTarget('127.0.0.1')}
              className="rounded-lg px-2.5 py-1 font-semibold text-blue-700 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-2xs transition"
              title="Localhost"
            >
              127.0.0.1
            </button>
          </div>

          {/* Theme Toggle (Light / Dark Mode) */}
          <button
            onClick={onToggleDarkMode}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 shadow-2xs transition hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-750"
            title={isDarkMode ? t.switchToLightMode : t.switchToDarkMode}
            aria-label={isDarkMode ? t.switchToLightMode : t.switchToDarkMode}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-400 transition transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-blue-600 transition transform hover:-rotate-12" />
            )}
            <span className="hidden sm:inline text-xs font-bold">
              {isDarkMode ? t.themeToggleLight : t.themeToggleDark}
            </span>
          </button>

          {/* Language Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 shadow-2xs transition hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-750"
              aria-expanded={langMenuOpen}
            >
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>{activeLang.nativeName}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 shadow-xl shadow-slate-900/10 dark:shadow-slate-950/60 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Select Language
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs font-medium transition ${
                      currentLang === lang.code
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                    {currentLang === lang.code && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

