import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, X, ShieldCheck, CheckCircle } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#141414] border border-[#FFD400]/40 text-white shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <h3 className="text-2xl font-black text-white">Contact & Business Support</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Have questions about course access, enterprise enrollment, or payment receipts?
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="space-y-3">
          
          {/* WhatsApp Direct Chat */}
          <a
            href="https://wa.me/6281214376824"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/40 hover:bg-[#25D366] hover:text-black transition group flex items-center justify-between text-xs font-bold"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#25D366] text-black flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 2c-5.516 0-9.999 4.482-9.999 9.999 0 1.763.459 3.486 1.332 5.003l-1.398 5.105 5.228-1.371c1.464.799 3.117 1.22 4.837 1.22 5.516 0 9.999-4.482 9.999-9.999 0-5.517-4.483-9.999-9.999-9.999zm0 18.28c-1.581 0-3.133-.424-4.49-1.228l-.322-.19-.313.819 1.077-3.931-.208-.331c-.872-1.388-1.333-3.003-1.333-4.668 0-4.568 3.718-8.286 8.286-8.286 4.567 0 8.286 3.718 8.286 8.286 0 4.568-3.718 8.286-8.286 8.286z"/>
                </svg>
              </div>
              <div>
                <span className="block text-white group-hover:text-black font-extrabold text-sm">
                  WhatsApp Support
                </span>
                <span className="text-neutral-400 group-hover:text-black font-mono">
                  +6281214376824
                </span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-lg bg-black text-[#39FF14] text-[11px] font-black group-hover:bg-black group-hover:text-[#39FF14]">
              Chat Now
            </span>
          </a>

          {/* Email Support */}
          <div className="p-3.5 rounded-2xl bg-[#1A1A1A] border border-white/10 flex items-center gap-3 text-xs">
            <div className="w-9 h-9 rounded-xl bg-[#222] text-[#FFD400] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-neutral-400 block font-medium">Email Address:</span>
              <span className="text-white font-bold text-sm">support@punjabxboom.com</span>
            </div>
          </div>

          {/* Address */}
          <div className="p-3.5 rounded-2xl bg-[#1A1A1A] border border-white/10 flex items-center gap-3 text-xs">
            <div className="w-9 h-9 rounded-xl bg-[#222] text-[#39FF14] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-neutral-400 block font-medium">Business Address:</span>
              <span className="text-white font-bold">Punjab X Boom HQ, Tower B, Business Park, Mohali, Punjab 160055, India</span>
            </div>
          </div>

        </div>

        {/* Quick Message Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-white/10">
          <span className="text-xs font-bold text-neutral-300 uppercase block">Send Quick Message</span>

          <input 
            type="text" 
            required 
            placeholder="Your Name" 
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#1D1D1D] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFD400]"
          />
          <textarea 
            required 
            rows={3} 
            placeholder="How can we help you?" 
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#1D1D1D] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FFD400]"
          />

          <button
            type="submit"
            disabled={submitted}
            className="w-full py-3 rounded-xl bg-[#FFD400] hover:bg-[#e6be00] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {submitted ? (
              <span className="flex items-center gap-1.5 text-black">
                <CheckCircle className="w-4 h-4" /> Message Sent Successfully!
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Send Support Message
              </span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
