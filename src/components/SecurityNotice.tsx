import React from 'react';
import { ShieldCheck, ExternalLink, Shield } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface SecurityNoticeProps {
  currentLang: Language;
}

export const SecurityNotice: React.FC<SecurityNoticeProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 text-xs text-slate-700 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-blue-50 border border-blue-200 p-2 text-blue-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <span>{t.securityNotice}</span>
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] text-slate-700 font-mono font-semibold">
                TCP Socket Standard (RFC 793)
              </span>
            </h4>
            <p className="mt-1 text-slate-600 leading-relaxed text-[11px] sm:text-xs">
              {t.securityNoticeDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <a
            href="https://scanme.nmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-900 hover:text-white transition shadow-2xs"
          >
            <span>scanme.nmap.org</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
