import React, { useState } from 'react';
import { Language } from '../types';
import { FAQS } from '../data/courseData';
import { translations } from '../translations';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';

interface FAQProps {
  currentLang: Language;
  onOpenContact: () => void;
}

export const FAQ: React.FC<FAQProps> = ({ currentLang, onOpenContact }) => {
  const t = translations[currentLang];
  const [openId, setOpenId] = useState<number | null>(1);

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 bg-[#0A0A0A] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1A1A] border border-white/10 text-[#FFD400] text-xs font-bold uppercase">
            <HelpCircle className="w-4 h-4 text-[#39FF14]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {t.faqTitle}
          </h2>
          <p className="text-neutral-400 text-sm">
            Everything you need to know about Punjab X Boom course access and details.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {FAQS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div 
                key={item.id}
                className="rounded-2xl bg-[#141414] border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(item.id)}
                  className="w-full p-5 text-left font-extrabold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-[#39FF14] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#222] text-[#FFD400] text-xs font-bold flex items-center justify-center shrink-0">
                      Q{item.id}
                    </span>
                    {item.question[currentLang]}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-[#39FF14] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/5 bg-[#111]">
                    {item.answer[currentLang]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Support CTA */}
        <div className="mt-10 p-6 rounded-2xl bg-[#141414] border border-white/10 text-center space-y-3">
          <h3 className="text-base font-bold text-white">
            Have more questions? We're here to help!
          </h3>
          <p className="text-xs text-neutral-400">
            Our support team is available 24/7 on WhatsApp & Email.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="https://wa.me/6281214376824"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#25D366] text-black font-extrabold text-xs flex items-center gap-2 hover:bg-[#20bd5a] transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 2c-5.516 0-9.999 4.482-9.999 9.999 0 1.763.459 3.486 1.332 5.003l-1.398 5.105 5.228-1.371c1.464.799 3.117 1.22 4.837 1.22 5.516 0 9.999-4.482 9.999-9.999 0-5.517-4.483-9.999-9.999-9.999zm0 18.28c-1.581 0-3.133-.424-4.49-1.228l-.322-.19-.313.819 1.077-3.931-.208-.331c-.872-1.388-1.333-3.003-1.333-4.668 0-4.568 3.718-8.286 8.286-8.286 4.567 0 8.286 3.718 8.286 8.286 0 4.568-3.718 8.286-8.286 8.286z"/>
              </svg>
              WhatsApp Us (+6281214376824)
            </a>

            <button
              onClick={onOpenContact}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-200 hover:text-white font-bold text-xs flex items-center gap-2 border border-neutral-700 hover:border-neutral-500 transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#FFD400]" />
              Email & Business Support
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
