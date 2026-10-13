import React from 'react';
import { Language, Testimonial } from '../types';
import { TESTIMONIALS } from '../data/courseData';
import { translations } from '../translations';
import { Star, Quote, CheckCircle, BookOpen } from 'lucide-react';

export interface CustomReview {
  id?: string | number;
  name: string;
  location: string;
  role: string;
  rating: number;
  comment: string | Record<Language, string>;
  avatar?: string;
  earnings?: string;
  moduleTitle?: string;
}

interface TestimonialsProps {
  currentLang: Language;
  customReviews?: CustomReview[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({ currentLang, customReviews = [] }) => {
  const t = translations[currentLang];

  // Combine default testimonials with custom student reviews
  const allReviews = [
    ...customReviews,
    ...TESTIMONIALS
  ];

  return (
    <section id="reviews" className="py-16 bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD400]/15 text-[#FFD400] text-xs font-bold">
            <Star className="w-4 h-4 fill-[#FFD400]" />
            <span>4.9 / 5.0 Rating from 14,800+ Students</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {t.testimonialsTitle}
          </h2>
          <p className="text-neutral-400 text-sm">
            Read real feedback from students who rated course modules & transformed their income with Punjab X Boom.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {allReviews.map((item, idx) => {
            const commentText = typeof item.comment === 'string'
              ? item.comment
              : item.comment[currentLang] || item.comment['en'];

            const defaultAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`;

            return (
              <div 
                key={item.id || idx}
                className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-[#39FF14] transition-all flex flex-col justify-between space-y-4 relative"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-neutral-800 pointer-events-none" />

                <div className="space-y-3">
                  {/* Module Title Badge if available */}
                  {item.moduleTitle && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFD400]/10 border border-[#FFD400]/30 text-[#FFD400] text-[11px] font-bold">
                      <BookOpen className="w-3 h-3" />
                      <span className="truncate max-w-[280px]">{item.moduleTitle}</span>
                    </div>
                  )}

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-[#FFD400]">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FFD400]" />
                    ))}
                  </div>

                  {/* Comment Text */}
                  <p className="text-sm text-neutral-200 leading-relaxed italic">
                    "{commentText}"
                  </p>
                </div>

                {/* Earnings Tag */}
                {item.earnings && (
                  <div className="px-3 py-1 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-bold inline-block self-start">
                    🚀 {item.earnings}
                  </div>
                )}

                {/* Author Info */}
                <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                  <img 
                    src={item.avatar || defaultAvatar} 
                    alt={item.name} 
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#39FF14]"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      {item.name}
                      <CheckCircle className="w-4 h-4 text-[#39FF14] fill-[#39FF14]/20" />
                    </h4>
                    <p className="text-xs text-neutral-400">
                      {item.role || 'Verified Student'} • {item.location || 'Punjab, India'}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

