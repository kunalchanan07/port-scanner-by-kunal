import React, { useState } from 'react';
import { Language, VideoModule } from '../types';
import { COURSE_MODULES, SKILLS_LIST } from '../data/courseData';
import { translations } from '../translations';
import { 
  Play, Download, Clock, BookOpen, CheckCircle, Sparkles, 
  Megaphone, Instagram, Search, TrendingUp, PenTool, DollarSign, 
  Briefcase, Globe, Mail, Palette, MessageCircle, Video, ChevronRight
} from 'lucide-react';

interface CurriculumProps {
  currentLang: Language;
  onOpenCheckout: () => void;
  onSelectModule: (module: VideoModule) => void;
}

const SKILL_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Megaphone, Instagram, Search, TrendingUp, PenTool, Sparkles, 
  DollarSign, Briefcase, Globe, Mail, Palette, MessageCircle, Video
};

export const Curriculum: React.FC<CurriculumProps> = ({ currentLang, onOpenCheckout, onSelectModule }) => {
  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<'modules' | 'skills'>('modules');

  return (
    <section id="curriculum" className="py-16 bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A1A] border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#FFD400]" />
            <span>Complete Masterclass</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t.courseCurriculum}
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base">
            6 Comprehensive Video Modules • 41 Practical Lessons • Multi-Language Voiceover & Subtitles
          </p>

          {/* Toggle Switch */}
          <div className="inline-flex p-1 bg-[#161616] border border-white/10 rounded-xl mt-4">
            <button
              onClick={() => setActiveTab('modules')}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'modules'
                  ? 'bg-[#FFD400] text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              📹 6 HD Video Modules
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'skills'
                  ? 'bg-[#39FF14] text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              🚀 14 Skills You'll Learn
            </button>
          </div>
        </div>

        {/* Tab 1: Video Modules Grid */}
        {activeTab === 'modules' && (
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSE_MODULES.map((module) => (
              <div 
                key={module.id} 
                className={`bg-[#141414] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all group ${
                  module.isSpecialForeignModule 
                    ? 'border-[#FFD400]/60 ring-1 ring-[#FFD400]/30 shadow-[0_0_25px_rgba(255,212,0,0.15)]' 
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Module Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-black/60">
                  <img 
                    src={module.thumbnail} 
                    alt={module.title[currentLang]} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  
                  {/* Play Overlay */}
                  <div 
                    onClick={() => onSelectModule(module)}
                    className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#39FF14] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-black ml-0.5" />
                    </div>
                  </div>

                  {/* Badge */}
                  {module.isSpecialForeignModule && (
                    <div className="absolute top-3 left-3 bg-[#FFD400] text-black text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow">
                      ⭐ High Income Hot Module
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5 border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-[#39FF14]" />
                    {module.duration}
                  </div>
                </div>

                {/* Module Details */}
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FFD400]">
                    <span>Module {module.id}</span>
                    <span>•</span>
                    <span className="text-neutral-400">{module.lessonsCount} HD Lessons</span>
                  </div>

                  <h3 className="text-base font-extrabold text-white line-clamp-2 leading-snug">
                    {module.title[currentLang]}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {module.description[currentLang]}
                  </p>

                  {/* Key Topics List */}
                  <div className="pt-2 space-y-1.5 border-t border-white/5">
                    {module.topics[currentLang].slice(0, 3).map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                        <CheckCircle className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
                        <span className="truncate">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Module Footer Actions */}
                <div className="p-4 bg-[#181818] border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-[#FFD400]" />
                    {module.resources.length} Downloadable Files
                  </span>

                  <button
                    onClick={() => onSelectModule(module)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-[#39FF14] hover:text-black text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Preview</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Tab 2: 14 Skills Grid */}
        {activeTab === 'skills' && (
          <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {SKILLS_LIST.map((skill) => {
              const IconComp = SKILL_ICONS[skill.icon] || Sparkles;
              return (
                <div 
                  key={skill.id}
                  className="p-4 rounded-2xl bg-[#141414] border border-white/10 hover:border-[#39FF14] transition-all flex items-start gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#222] group-hover:bg-[#39FF14] text-[#FFD400] group-hover:text-black flex items-center justify-center shrink-0 transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white group-hover:text-[#39FF14] transition-colors">
                      {skill.name}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 leading-snug">
                      {skill.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Call to action */}
        <div className="mt-12 text-center">
          <button
            onClick={onOpenCheckout}
            className="px-8 py-4 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-base shadow-[0_6px_0_#2bc410] active:translate-y-1 active:shadow-none transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Get Instant Access to All Modules for ₹99</span>
            <Sparkles className="w-5 h-5 fill-black" />
          </button>
        </div>

      </div>
    </section>
  );
};
