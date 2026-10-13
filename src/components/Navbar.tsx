import React, { useState, useRef, useEffect } from 'react';
import { Shield, Globe, Code2, ChevronDown, Check, Sparkles, Terminal } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenPythonModal: () => void;
  onSelectTarget: (host: string) => void;
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand: Port Scanner by Kunal */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-600 p-0.5 shadow-md shadow-blue-900/10">
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
              <span className="text-lg font-black tracking-tight text-slate-950 font-sans sm:text-xl">
                {t.appName}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700">
                <Sparkles className="h-2.5 w-2.5 text-blue-500" />
                {t.themeBadge}
              </span>
            </div>
            <p className="hidden text-xs font-medium text-slate-500 md:block max-w-md truncate">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Quick Targets & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Target Chips */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/90 p-1 text-xs text-slate-600">
            <span className="px-2 text-[11px] text-slate-500 font-bold uppercase tracking-wider">{t.quickHosts}</span>
            <button
              onClick={() => onSelectTarget('scanme.nmap.org')}
              className="rounded-lg px-2.5 py-1 font-semibold text-blue-700 hover:bg-white hover:shadow-2xs transition"
              title="Official Nmap authorized test host"
            >
              scanme.nmap.org
            </button>
            <button
              onClick={() => onSelectTarget('1.1.1.1')}
              className="rounded-lg px-2.5 py-1 font-semibold text-blue-700 hover:bg-white hover:shadow-2xs transition"
              title="Cloudflare DNS"
            >
              1.1.1.1
            </button>
            <button
              onClick={() => onSelectTarget('127.0.0.1')}
              className="rounded-lg px-2.5 py-1 font-semibold text-blue-700 hover:bg-white hover:shadow-2xs transition"
              title="Localhost"
            >
              127.0.0.1
            </button>
          </div>

          {/* Python Code Modal Trigger */}
          <button
            onClick={onOpenPythonModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs transition hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700"
          >
            <Code2 className="h-4 w-4 text-blue-600" />
            <span>{t.pythonScriptTab}</span>
          </button>

          {/* Language Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-2xs transition hover:border-blue-400 hover:bg-slate-50"
              aria-expanded={langMenuOpen}
            >
              <Globe className="h-4 w-4 text-blue-600" />
              <span>{activeLang.nativeName}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-900/10 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                    {currentLang === lang.code && <Check className="h-4 w-4 text-blue-600" />}
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
