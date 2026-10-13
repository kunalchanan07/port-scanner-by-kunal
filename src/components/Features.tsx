import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { 
  Infinity, Smartphone, Video, FileCheck, Award, 
  Users, Target, MessageSquare, CheckCircle2 
} from 'lucide-react';

interface FeaturesProps {
  currentLang: Language;
  onOpenCheckout: () => void;
}

export const Features: React.FC<FeaturesProps> = ({ currentLang, onOpenCheckout }) => {
  const t = translations[currentLang];

  const featuresList = [
    {
      icon: Infinity,
      color: 'text-[#FFD400]',
      title: 'Lifetime Access',
      desc: 'Watch video lessons anytime on demand. Access never expires.'
    },
    {
      icon: Smartphone,
      color: 'text-[#39FF14]',
      title: 'Mobile Friendly',
      desc: 'Seamlessly watch on Android, iPhone, Tablet or Desktop PC.'
    },
    {
      icon: Video,
      color: 'text-[#FFD400]',
      title: 'HD Video Lessons',
      desc: 'Crystal-clear 1080p video lessons with step-by-step screen recording.'
    },
    {
      icon: FileCheck,
      color: 'text-[#39FF14]',
      title: 'Downloadable Resources',
      desc: 'Copy-paste cold email scripts, ad templates, and cheat sheets.'
    },
    {
      icon: Award,
      color: 'text-[#FFD400]',
      title: 'ISO Certificate',
      desc: 'Earn an ISO-verified shareable Certificate of Completion for your CV.'
    },
    {
      icon: Target,
      color: 'text-[#39FF14]',
      title: 'Beginner Friendly',
      desc: 'No coding, prior experience, or technical background required.'
    },
    {
      icon: Users,
      color: 'text-[#FFD400]',
      title: 'Practical Projects',
      desc: 'Build real ad campaigns and design live websites alongside lessons.'
    },
    {
      icon: MessageSquare,
      color: 'text-[#39FF14]',
      title: 'Community Support',
      desc: 'Exclusive WhatsApp student group to ask questions and network.'
    },
  ];

  return (
    <section className="py-16 bg-[#111111] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase text-[#39FF14] tracking-widest">
            Course Benefits
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {t.courseFeatures}
          </h2>
          <p className="text-neutral-400 text-sm">
            Everything you need to launch your digital career for less than the cost of a pizza!
          </p>
        </div>

        {/* 8 Feature Cards Grid */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-[#181818] border border-white/10 hover:border-neutral-600 transition-all space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl bg-[#222] flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Why Choose Punjab X Boom Section */}
        <div className="mt-16 bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-black text-center text-white mb-6">
            {t.whyChooseUs}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 text-sm font-semibold">
            <div className="p-3.5 rounded-xl bg-[#111] border border-white/5 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#39FF14] shrink-0" />
              <span>✔ Affordable Price (Only ₹99 vs ₹5000+ competitors)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111] border border-white/5 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#39FF14] shrink-0" />
              <span>✔ Industry-Level High Income Skills</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111] border border-white/5 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#39FF14] shrink-0" />
              <span>✔ Learn From Anywhere (Phone / Laptop)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111] border border-white/5 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#39FF14] shrink-0" />
              <span>✔ Multilingual (English, Hindi & Punjabi)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111] border border-white/5 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#39FF14] shrink-0" />
              <span>✔ Instant Access Right After Payment</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111] border border-white/5 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#39FF14] shrink-0" />
              <span>✔ Regular Free Content & Strategy Updates</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
