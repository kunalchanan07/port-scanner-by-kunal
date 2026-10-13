import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { Check, ShieldCheck, Sparkles, Clock, Lock, ArrowRight } from 'lucide-react';

interface PricingProps {
  currentLang: Language;
  onOpenCheckout: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ currentLang, onOpenCheckout }) => {
  const t = translations[currentLang];

  // Countdown timer simulation (14 mins 30 secs)
  const [timeLeft, setTimeLeft] = useState(870);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section id="pricing" className="py-16 bg-[#111111] text-white border-t border-white/10 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-gradient-to-r from-[#FFD400]/10 via-[#39FF14]/10 to-[#FFD400]/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD400]/15 border border-[#FFD400]/30 text-[#FFD400] text-xs font-black uppercase">
            <Sparkles className="w-4 h-4 text-[#39FF14]" />
            <span>Special Launch Price</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            {t.pricingTitle}
          </h2>
          <p className="text-neutral-300 text-sm sm:text-base">
            Get complete access to all 6 modules, resources, scripts & certificate today.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mt-10 max-w-lg mx-auto">
          <div className="rounded-3xl bg-gradient-to-b from-[#FFD400] via-[#39FF14] to-[#111] p-1 shadow-[0_0_50px_rgba(57,255,20,0.3)] relative">
            
            {/* Top Hot Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#39FF14] text-black text-xs font-black px-4 py-1.5 rounded-full uppercase shadow-lg tracking-wider">
              🔥 Limited Seats At ₹99
            </div>

            <div className="rounded-[22px] bg-[#141414] p-6 sm:p-8 space-y-6">
              
              {/* Timer Bar */}
              <div className="bg-[#1D1D1D] border border-red-500/30 rounded-xl p-3 flex items-center justify-between text-xs sm:text-sm">
                <span className="flex items-center gap-2 text-red-400 font-bold">
                  <Clock className="w-4 h-4 animate-pulse" />
                  {t.offerEndsSoon}
                </span>
                <span className="font-mono font-black text-[#FFD400] bg-black px-2.5 py-1 rounded border border-white/10 text-base">
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* Price Details */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl text-neutral-500 line-through font-bold">
                    {t.originalPrice}
                  </span>
                  <span className="text-5xl sm:text-6xl font-black text-[#39FF14] tracking-tight">
                    ₹99
                  </span>
                </div>
                <p className="text-xs font-extrabold text-[#FFD400] uppercase tracking-wider">
                  Save 70% Discount • One-Time Payment
                </p>
              </div>

              {/* Included Features List */}
              <div className="space-y-3 pt-2 text-sm text-neutral-200 border-t border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><b>6 HD Video Modules</b> (Basic to Advanced Digital Marketing)</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FFD400]/20 text-[#FFD400] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><b>Selling Websites to Foreign Clients ($300 - $2,500/site)</b></span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><b>Copy-Paste Cold Email Scripts</b> & Proposal Templates</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><b>3 Languages:</b> English, हिन्दी (Hindi) & ਪੰਜਾਬੀ (Punjabi)</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><b>Lifetime Course Access</b> + Future Updates Free</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><b>ISO Shareable Certificate of Completion</b></span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><b>Exclusive WhatsApp Student Group Access</b></span>
                </div>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={onOpenCheckout}
                className="w-full py-4 rounded-2xl bg-[#39FF14] hover:bg-[#32e012] text-black font-black text-lg shadow-[0_8px_0_#2bc410] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Buy Now – ₹99</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Supported Payment Logos / Security */}
              <div className="space-y-2 text-center pt-2 border-t border-white/5">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400">
                  <Lock className="w-3.5 h-3.5 text-[#39FF14]" />
                  <span>256-Bit Secure Checkout via Razorpay</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-neutral-400 font-bold">
                  <span className="px-2 py-0.5 rounded bg-[#222] border border-white/10 text-[#FFD400]">Google Pay</span>
                  <span className="px-2 py-0.5 rounded bg-[#222] border border-white/10 text-[#39FF14]">PhonePe</span>
                  <span className="px-2 py-0.5 rounded bg-[#222] border border-white/10 text-cyan-400">Paytm</span>
                  <span className="px-2 py-0.5 rounded bg-[#222] border border-white/10 text-white">BHIM UPI</span>
                  <span className="px-2 py-0.5 rounded bg-[#222] border border-white/10 text-orange-400">Cards</span>
                  <span className="px-2 py-0.5 rounded bg-[#222] border border-white/10 text-purple-400">NetBanking</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
