import React from 'react';
import { Mail, Phone, MapPin, Heart, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenContact: () => void;
  onOpenCheckout: () => void;
  onOpenSupabase?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact, onOpenCheckout, onOpenSupabase }) => {
  return (
    <footer className="bg-[#050505] text-white border-t border-white/10 pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FFD400] text-black font-black text-lg flex items-center justify-center">
                PXB
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                PUNJAB <span className="text-[#39FF14]">X</span> <span className="text-[#FFD400]">BOOM</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Learn Digital Marketing. Grow Your Income. Build Your Future. Master high-income marketing & website selling skills in 3 languages.
            </p>
            <p className="text-xs font-mono text-[#39FF14]">
              Tagline: Learn • Grow • Earn
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider text-[#FFD400]">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><a href="#curriculum" className="hover:text-white transition">Course Modules</a></li>
              <li><a href="#foreign-clients" className="hover:text-[#39FF14] transition">Foreign Client Module</a></li>
              <li><a href="#reviews" className="hover:text-white transition">Student Testimonials</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing (₹99)</a></li>
              <li><a href="#faq" className="hover:text-white transition">Frequently Asked Questions</a></li>
            </ul>
          </div>

          {/* Col 3: Contact & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider text-[#39FF14]">
              Contact Details
            </h4>
            <ul className="space-y-2 text-xs text-neutral-300">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FFD400] shrink-0" />
                <a href="mailto:support@punjabxboom.com" className="hover:underline">
                  support@punjabxboom.com
                </a>
              </li>

              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 2c-5.516 0-9.999 4.482-9.999 9.999 0 1.763.459 3.486 1.332 5.003l-1.398 5.105 5.228-1.371c1.464.799 3.117 1.22 4.837 1.22 5.516 0 9.999-4.482 9.999-9.999 0-5.517-4.483-9.999-9.999-9.999zm0 18.28c-1.581 0-3.133-.424-4.49-1.228l-.322-.19-.313.819 1.077-3.931-.208-.331c-.872-1.388-1.333-3.003-1.333-4.668 0-4.568 3.718-8.286 8.286-8.286 4.567 0 8.286 3.718 8.286 8.286 0 4.568-3.718 8.286-8.286 8.286z"/>
                </svg>
                <a 
                  href="https://wa.me/6281214376824" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition font-bold"
                >
                  WhatsApp: +6281214376824
                </a>
              </li>

              <li className="flex items-start gap-2 pt-1 text-neutral-400">
                <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <span>Punjab X Boom HQ, Mohali, Punjab 160055, India</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Guaranteed Purchase */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#121212] border border-white/10">
            <span className="text-xs font-black uppercase text-[#FFD400] tracking-wider block">
              100% Verified Access
            </span>
            <p className="text-xs text-neutral-400">
              Instant automated enrollment after Razorpay checkout. 24/7 dedicated email and WhatsApp support.
            </p>
            <button
              onClick={onOpenCheckout}
              className="w-full py-2.5 rounded-xl bg-[#39FF14] text-black font-extrabold text-xs hover:bg-[#32e012] transition cursor-pointer"
            >
              Enroll Now for ₹99
            </button>
          </div>

        </div>

        {/* Bottom Bar & Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 Punjab X Boom. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={onOpenContact} className="hover:text-white transition cursor-pointer">Support</button>
            <span>•</span>
            {onOpenSupabase && (
              <>
                <button onClick={onOpenSupabase} className="text-[#39FF14] hover:underline font-bold transition cursor-pointer flex items-center gap-1">
                  Supabase DB & SQL
                </button>
                <span>•</span>
              </>
            )}
            <span className="text-neutral-600">Privacy Policy</span>
            <span>•</span>
            <span className="text-neutral-600">Terms of Service</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
