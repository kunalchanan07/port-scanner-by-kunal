import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { CheckCircle2, Play, Sparkles, ShieldCheck, Globe2, ArrowRight } from 'lucide-react';

interface HeroProps {
  currentLang: Language;
  onOpenCheckout: () => void;
  onOpenPreviewVideo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ currentLang, onOpenCheckout, onOpenPreviewVideo }) => {
  const t = translations[currentLang];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0A0A0A] via-[#111111] to-[#0A0A0A] pt-8 pb-16 lg:pt-14 lg:pb-24 text-white">
      {/* Glow Effects Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#39FF14]/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-[#FFD400]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Copy & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Discount Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A1A1A] border border-[#39FF14]/40 text-[#39FF14] text-xs sm:text-sm font-bold shadow-inner">
              <Sparkles className="w-4 h-4 animate-pulse text-[#FFD400]" />
              <span>{t.heroBadge}</span>
              <span className="bg-[#FFD400] text-black text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ml-1">
                70% OFF
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              {t.heroHeadline}
            </h1>

            {/* Subheadline */}
            <p className="text-neutral-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t.heroSubheadline}
            </p>

            {/* Language Support Badge Box */}
            <div className="p-3.5 rounded-2xl bg-[#161616] border border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs sm:text-sm font-semibold text-neutral-200 shadow-md">
              <div className="flex items-center gap-1.5 text-[#FFD400] font-bold">
                <Globe2 className="w-4 h-4 text-[#39FF14]" />
                <span>{t.oneCourseThreeLangs}:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#222] border border-white/10 text-white font-medium flex items-center gap-1">
                  🇬🇧 English
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#222] border border-white/10 text-white font-medium flex items-center gap-1">
                  🇮🇳 हिन्दी
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#222] border border-white/10 text-white font-medium flex items-center gap-1">
                  🇮🇳 ਪੰਜਾਬੀ
                </span>
              </div>
            </div>

            {/* Special Highlight Pill for Foreign Clients Module */}
            <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-[#FFD400]/15 to-[#39FF14]/15 border border-[#FFD400]/30 text-xs sm:text-sm text-neutral-100">
              <span className="bg-[#FFD400] text-black font-extrabold text-[11px] px-2 py-0.5 rounded uppercase">
                Includes
              </span>
              <span>
                <b>Module 4:</b> Selling Websites to Foreign Clients ($300 – $2,500/site)
              </span>
            </div>

            {/* Price Box & CTA Buttons */}
            <div className="pt-2 space-y-4">
              <div className="flex items-baseline justify-center lg:justify-start gap-4">
                <span className="text-4xl sm:text-5xl font-black text-[#39FF14] tracking-tight">
                  ₹99
                </span>
                <span className="text-xl sm:text-2xl text-neutral-500 line-through font-bold">
                  ₹330
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#FFD400] text-black text-xs font-black uppercase">
                  Save 70% Today
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={onOpenCheckout}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-lg shadow-[0_8px_0_#2bc410] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>🟢 Buy Now – ₹99</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onOpenPreviewVideo}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-base flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Play className="w-5 h-5 text-[#FFD400] fill-[#FFD400]" />
                  <span>Watch Free Course Trailer</span>
                </button>
              </div>

              {/* Guarantees list */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs font-medium text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14]" /> Lifetime Access
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14]" /> Mobile Friendly
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14]" /> Verifiable ISO Certificate
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FFD400]" /> Instant Course Access
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: High Impact Video Card Visual */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Glowing Border */}
              <div className="relative rounded-3xl bg-gradient-to-b from-[#FFD400] via-[#39FF14] to-[#111] p-1 shadow-[0_0_40px_rgba(57,255,20,0.25)]">
                <div className="rounded-[22px] bg-[#111111] p-5 space-y-4">
                  
                  {/* Video Thumbnail Area */}
                  <div 
                    onClick={onOpenPreviewVideo}
                    className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer border border-white/10"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80" 
                      alt="Digital Marketing Course Preview" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#39FF14] text-black flex items-center justify-center shadow-[0_0_25px_rgba(57,255,20,0.8)] group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 fill-black ml-1" />
                      </div>
                    </div>
                    
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold text-white bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                      <span className="flex items-center gap-1.5 text-[#FFD400]">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Course Preview
                      </span>
                      <span className="text-neutral-300">6 HD Video Modules</span>
                    </div>
                  </div>

                  {/* Highlights Grid inside Card */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#1A1A1A] border border-white/5 space-y-0.5">
                      <span className="text-neutral-400 block font-medium">Original Price</span>
                      <span className="text-neutral-400 line-through font-bold text-sm">₹330</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 space-y-0.5">
                      <span className="text-[#39FF14] block font-bold">Special Offer</span>
                      <span className="text-[#39FF14] font-black text-base">₹99 ONLY</span>
                    </div>
                  </div>

                  {/* Live Student Count Activity */}
                  <div className="pt-1 flex items-center justify-between text-xs text-neutral-300 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <img className="w-7 h-7 rounded-full border-2 border-[#111]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Student" />
                        <img className="w-7 h-7 rounded-full border-2 border-[#111]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Student" />
                        <img className="w-7 h-7 rounded-full border-2 border-[#111]" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Student" />
                      </div>
                      <span className="font-medium text-neutral-300">
                        <b>14,820+</b> Students Enrolled
                      </span>
                    </div>
                    <span className="text-[#FFD400] font-bold">4.9 ★★★★★</span>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
