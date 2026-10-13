import { VideoModule, Testimonial, FAQItem } from '../types';

export const SKILLS_LIST = [
  { id: 'fb', name: 'Facebook Ads', icon: 'Megaphone', desc: 'Run high-ROI ads & target audiences' },
  { id: 'insta', name: 'Instagram Marketing', icon: 'Instagram', desc: 'Reels growth, viral hooks & branding' },
  { id: 'google', name: 'Google Ads', icon: 'Search', desc: 'PPC, Search Ads & YouTube video ads' },
  { id: 'seo', name: 'SEO Mastery', icon: 'TrendingUp', desc: 'Rank #1 on Google search organically' },
  { id: 'content', name: 'Content Marketing', icon: 'PenTool', desc: 'Engaging scripts, blogs & viral copy' },
  { id: 'ai', name: 'AI Marketing Tools', icon: 'Sparkles', desc: 'ChatGPT, Midjourney & AI automations' },
  { id: 'affiliate', name: 'Affiliate Marketing', icon: 'DollarSign', desc: 'Passive income through affiliate links' },
  { id: 'freelance', name: 'Freelancing Mastery', icon: 'Briefcase', desc: 'Get clients on Upwork & Fiverr' },
  { id: 'web', name: 'Website Building', icon: 'Globe', desc: 'No-code WordPress & Elementor sites' },
  { id: 'foreign', name: 'Selling Websites Abroad', icon: 'DollarSign', desc: 'Pitch USA/UK clients for $300-$2500' },
  { id: 'email', name: 'Email Marketing', icon: 'Mail', desc: 'Automated newsletters & sales sequences' },
  { id: 'canva', name: 'Canva Design', icon: 'Palette', desc: 'Social media posts & ad banner designs' },
  { id: 'whatsapp', name: 'WhatsApp Marketing', icon: 'MessageCircle', desc: 'Broadcasts, chatbots & lead funnels' },
  { id: 'youtube', name: 'YouTube Growth', icon: 'Video', desc: 'Channel growth, monetization & SEO' },
];

export const COURSE_MODULES: VideoModule[] = [
  {
    id: 1,
    title: {
      en: 'Module 1: Foundations of Digital Marketing & High-Income Mindset',
      hi: 'मॉड्यूल 1: डिजिटल मार्केटिंग की नींव और उच्च-आय मानसिकता',
      pa: 'ਮੋਡਿਊਲ 1: ਡਿਜੀਟਲ ਮਾਰਕੀਟਿੰਗ ਦੀ ਨੀਂਹ ਅਤੇ ਉੱਚ-ਆਮਦਨ ਮਾਨਸਿਕਤਾ'
    },
    description: {
      en: 'Understand the core concepts of digital marketing, funnels, target customer psychology, and setting up your freelancing ecosystem.',
      hi: 'डिजिटल मार्केटिंग, फ़नल, लक्षित ग्राहक मनोविज्ञान और अपने फ्रीलांसिंग पारिस्थितिकी तंत्र को स्थापित करने की मुख्य अवधारणाओं को समझें।',
      pa: 'ਡਿਜੀਟਲ ਮਾਰਕੀਟਿੰਗ, ਫਨਲ, ਨਿਸ਼ਾਨਾ ਗਾਹਕ ਮਨੋਵਿਗਿਆਨ, ਅਤੇ ਆਪਣੇ ਫ੍ਰੀਲਾਂਸਿੰਗ ਸਿਸਟਮ ਨੂੰ ਸਥਾਪਿਤ ਕਰਨ ਦੇ ਮੁੱਖ ਸੰਕਲਪਾਂ ਨੂੰ ਸਮਝੋ।'
    },
    duration: '45 mins',
    lessonsCount: 5,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder sample HD video
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    topics: {
      en: ['Digital Marketing Roadmap', 'Building Customer Personas', 'High Converting Sales Funnels', 'Setting up Professional Profiles'],
      hi: ['डिजिटल मार्केटिंग रोडमैप', 'ग्राहक व्यक्तित्व का निर्माण', 'उच्च रूपांतरण बिक्री फ़नल', 'पेशेवर प्रोफ़ाइल सेट करना'],
      pa: ['ਡਿਜੀਟਲ ਮਾਰਕੀਟਿੰਗ ਰੋਡਮੈਪ', 'ਗਾਹਕ ਪ੍ਰੋਫਾਈਲ ਬਣਾਉਣਾ', 'ਉੱਚ ਰੂਪਾਂਤਰਨ ਸੇਲਜ਼ ਫਨਲ', 'ਪੇਸ਼ੇਵਰ ਪ੍ਰੋਫਾਈਲ ਸੈੱਟ ਕਰਨਾ']
    },
    resources: [
      { title: 'Digital Marketing Roadmap Cheat Sheet', type: 'pdf', size: '2.4 MB' },
      { title: 'Sales Funnel Blueprint Checklist', type: 'pdf', size: '1.8 MB' }
    ]
  },
  {
    id: 2,
    title: {
      en: 'Module 2: Meta Ads Mastery (Facebook & Instagram Lead Generation)',
      hi: 'मॉड्यूल 2: मेटा एड्स मास्टरी (फेसबुक और इंस्टाग्राम लीड जेनरेशन)',
      pa: 'ਮੋਡਿਊਲ 2: ਮੈਟਾ ਐਡਸ ਮਾਸਟਰੀ (ਫੇਸਬੁੱਕ ਅਤੇ ਇੰਸਟਾਗ੍ਰਾਮ ਲੀਡ ਜਨਰੇਸ਼ਨ)'
    },
    description: {
      en: 'Master Meta Ads Manager, launch low-cost lead generation campaigns, write high-converting copy, and design graphics on Canva.',
      hi: 'मेटा एड्स मैनेजर में महारत हासिल करें, कम लागत वाले लीड जेनरेशन अभियान चलाएं, उच्च-रूपांतरण वाली प्रति लिखें और कैनवा पर ग्राफिक्स डिज़ाइन करें।',
      pa: 'ਮੈਟਾ ਐਡਸ ਮੈਨੇਜਰ ਵਿੱਚ ਮੁਹਾਰਤ ਹਾਸਲ ਕਰੋ, ਘੱਟ ਲਾਗਤ ਵਾਲੀਆਂ ਲੀਡ ਜਨਰੇਸ਼ਨ ਮੁਹਿੰਮਾਂ ਚਲਾਓ, ਅਤੇ ਕੈਨਵਾ \'ਤੇ ਗ੍ਰਾਫਿਕਸ ਡਿਜ਼ਾਈਨ ਕਰੋ।'
    },
    duration: '1 hr 15 mins',
    lessonsCount: 7,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
    topics: {
      en: ['Meta Ads Manager Setup', 'Laser-Targeted Audience Building', 'Ad Creatives with Canva', 'WhatsApp & Lead Form Ads'],
      hi: ['मेटा एड्स मैनेजर सेटअप', 'लेजर-लक्षित दर्शक निर्माण', 'कैनवा के साथ एड क्रिएटिव', 'व्हाट्सएप और लीड फॉर्म एड्स'],
      pa: ['ਮੈਟਾ ਐਡਸ ਮੈਨੇਜਰ ਸੈੱਟਅੱਪ', 'ਨਿਸ਼ਾਨਾ ਦਰਸ਼ਕ ਬਣਾਉਣਾ', 'ਕੈਨਵਾ ਨਾਲ ਐਡ ਕ੍ਰਿਏਟਿਵ', 'ਵਟਸਐਪ ਅਤੇ ਲੀਡ ਫਾਰਮ ਐਡਸ']
    },
    resources: [
      { title: 'Facebook Ad Copy Templates (50+ Hooks)', type: 'template', size: '3.1 MB' },
      { title: 'Canva Ad Banner Design Kit', type: 'link' }
    ]
  },
  {
    id: 3,
    title: {
      en: 'Module 3: No-Code Website Building & Landing Page Creation',
      hi: 'मॉड्यूल 3: नो-कोड वेबसाइट बिल्डिंग और लैंडिंग पेज निर्माण',
      pa: 'ਮੋਡਿਊਲ 3: ਨੋ-ਕੋਡ ਵੈੱਬਸਾਈਟ ਬਿਲਡਿੰਗ ਅਤੇ ਲੈਂਡਿੰਗ ਪੇਜ ਬਣਾਉਣਾ'
    },
    description: {
      en: 'Build stunning, fast-loading business websites and high-converting sales landing pages without coding using WordPress and Elementor.',
      hi: 'वर्डप्रेस और एलीमेंटर का उपयोग करके बिना कोडिंग के शानदार, तेज़-लोडिंग व्यावसायिक वेबसाइटें और उच्च-रूपांतरण बिक्री लैंडिंग पृष्ठ बनाएं।',
      pa: 'ਵਰਡਪ੍ਰੈਸ ਅਤੇ ਐਲੀਮੈਂਟਰ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਬਿਨਾਂ ਕੋਡਿੰਗ ਦੇ ਸ਼ਾਨਦਾਰ, ਤੇਜ਼-ਲੋਡਿੰਗ ਵੈੱਬਸਾਈਟਾਂ ਅਤੇ ਲੈਂਡਿੰਗ ਪੇਜ ਬਣਾਓ।'
    },
    duration: '1 hr 30 mins',
    lessonsCount: 8,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80',
    topics: {
      en: ['Domain & Hosting Basics', 'WordPress Setup in 10 Mins', 'Elementor Drag & Drop Builder', 'Mobile Responsive Optimization'],
      hi: ['डोमेन और होस्टिंग मूल बातें', '10 मिनट में वर्डप्रेस सेटअप', 'एलीमेंटर ड्रैग एंड ड्रॉप बिल्डर', 'मोबाइल रिस्पॉन्सिव अनुकूलन'],
      pa: ['ਡੋਮੇਨ ਅਤੇ ਹੋਸਟਿੰਗ ਬੁਨਿਆਦੀ ਗੱਲਾਂ', '10 ਮਿੰਟਾਂ ਵਿੱਚ ਵਰਡਪ੍ਰੈਸ ਸੈੱਟਅੱਪ', 'ਐਲੀਮੈਂਟਰ ਡਰੈਗ ਐਂਡ ਡ੍ਰੌਪ ਬਿਲਡਰ', 'ਮੋਬਾਈਲ ਰਿਸਪਾਂਸਿਵ ਅਨੁਕੂਲਨ']
    },
    resources: [
      { title: 'Free Starter Website Template Pack', type: 'template', size: '12 MB' },
      { title: 'Must-Have Plugins Checklist', type: 'pdf', size: '1.2 MB' }
    ]
  },
  {
    id: 4,
    title: {
      en: 'Module 4: Selling Websites to Foreign Clients ($300 – $2,500/Deal)',
      hi: 'मॉड्यूल 4: विदेशी क्लाइंट्स को वेबसाइट बेचना ($300 – $2,500/डील)',
      pa: 'ਮੋਡਿਊਲ 4: ਵਿਦੇਸ਼ੀ ਗਾਹਕਾਂ ਨੂੰ ਵੈੱਬਸਾਈਟਾਂ ਵੇਚਣਾ ($300 – $2,500/ਡੀਲ)'
    },
    description: {
      en: 'The step-by-step framework to prospect businesses in USA, UK, Canada & Australia, send cold emails, pitch clients, and accept USD payments via Wise/Stripe directly into Indian Bank accounts.',
      hi: 'अमेरिका, यूके, कनाडा और ऑस्ट्रेलिया में व्यवसायों की खोज करने, कोल्ड ईमेल भेजने, क्लाइंट्स को पिच करने और वाइज़/स्ट्राइप के माध्यम से सीधे भारतीय बैंक खातों में यूएसडी भुगतान स्वीकार करने का चरण-दर-चरण ढांचा।',
      pa: 'ਅਮਰੀਕਾ, ਯੂਕੇ, ਕੈਨੇਡਾ ਅਤੇ ਆਸਟ੍ਰੇਲੀਆ ਵਿੱਚ ਗਾਹਕਾਂ ਨੂੰ ਲੱਭਣ, ਕੋਲਡ ਈਮੇਲ ਭੇਜਣ, ਅਤੇ ਵਾਈਜ਼/ਸਟ੍ਰਾਈਪ ਰਾਹੀਂ ਭਾਰਤੀ ਬੈਂਕ ਖਾਤਿਆਂ ਵਿੱਚ USD ਪ੍ਰਾਪਤ ਕਰਨ ਦਾ ਤਰੀਕਾ।'
    },
    duration: '2 hrs 00 mins',
    lessonsCount: 10,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    isSpecialForeignModule: true,
    topics: {
      en: ['Finding US/UK Businesses with Outdated Websites', 'High-Converting Cold Email Scripts', 'Zoom Client Pitch & Live Demo Strategy', 'Setting Up Wise/Stripe/PayPal for Direct INR Settlement'],
      hi: ['पुरानी वेबसाइटों वाले यूएस/यूके व्यवसायों को खोजना', 'उच्च-रूपांतरण वाले कोल्ड ईमेल स्क्रिप्ट', 'ज़ूम क्लाइंट पिच और लाइव डेमो रणनीति', 'सीधे आईएनआर निपटान के लिए वाइज़/स्ट्राइप/पेपाल सेट करना'],
      pa: ['ਪੁਰਾਣੀਆਂ ਵੈੱਬਸਾਈਟਾਂ ਵਾਲੇ ਯੂਐਸ/ਯੂਕੇ ਕਾਰੋਬਾਰਾਂ ਨੂੰ ਲੱਭਣਾ', 'ਉੱਚ-ਰੂਪਾਂਤਰਨ ਵਾਲੀਆਂ ਕੋਲਡ ਈਮੇਲ ਸਕ੍ਰਿਪਟਾਂ', 'ਜ਼ੂਮ ਗਾਹਕ ਪਿਚ ਅਤੇ ਲਾਈਵ ਡੈਮੋ ਰਣਨੀਤੀ', 'ਸਿੱਧੇ INR ਭੁਗਤਾਨ ਲਈ ਵਾਈਜ਼/ਸਟ੍ਰਾਈਪ ਸੈੱਟ ਕਰਨਾ']
    },
    resources: [
      { title: 'Copy-Paste Cold Email Scripts (Tested with 100+ US Clients)', type: 'script', size: '2.8 MB' },
      { title: 'Client Proposal & Invoice Template (USD)', type: 'template', size: '1.5 MB' },
      { title: 'Wise & Stripe Setup Guide for Indians', type: 'pdf', size: '3.4 MB' }
    ]
  },
  {
    id: 5,
    title: {
      en: 'Module 5: Google Ads, SEO & AI Marketing Automation',
      hi: 'मॉड्यूल 5: गूगल एड्स, एसईओ और एआई मार्केटिंग ऑटोमेशन',
      pa: 'ਮੋਡਿਊਲ 5: ਗੂਗਲ ਐਡਸ, ਐਸਈਓ ਅਤੇ ਏਆਈ ਮਾਰਕੀਟਿੰਗ ਆਟੋਮੇਸ਼ਨ'
    },
    description: {
      en: 'Rank websites on Google Search Page 1, run high-intent Google Search Ads, and leverage ChatGPT & AI tools to write ad copy and automate content.',
      hi: 'गूगल सर्च पेज 1 पर वेबसाइटों को रैंक करें, उच्च-इरादे वाले गूगल सर्च एड्स चलाएं, और एड कॉपी लिखने और कंटेंट को स्वचालित करने के लिए चैटजीपीटी और एआई टूल का लाभ उठाएं।',
      pa: 'ਗੂਗਲ ਖੋਜ ਪੰਨੇ 1 \'ਤੇ ਵੈੱਬਸਾਈਟਾਂ ਨੂੰ ਰੈਂਕ ਦਿਓ, ਗੂਗਲ ਖੋਜ ਇਸ਼ਤਿਹਾਰ ਚਲਾਓ, ਅਤੇ ਸਮੱਗਰੀ ਲਈ ਏਆਈ ਟੂਲਸ ਦੀ ਵਰਤੋਂ ਕਰੋ।'
    },
    duration: '1 hr 10 mins',
    lessonsCount: 6,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80',
    topics: {
      en: ['On-Page & Technical SEO', 'Google Search Ads Setup', 'Keyword Research for Local Businesses', 'ChatGPT Prompts for Ad Copy & Content'],
      hi: ['ऑन-पेज और तकनीकी एसईओ', 'गूगल सर्च एड्स सेटअप', 'स्थानीय व्यवसायों के लिए कीवर्ड अनुसंधान', 'एड कॉपी और कंटेंट के लिए चैटजीपीटी प्रॉम्प्ट'],
      pa: ['ਆਨ-ਪੇਜ ਅਤੇ ਤਕਨੀਕੀ ਐਸਈਓ', 'ਗੂਗਲ ਖੋਜ ਐਡਸ ਸੈੱਟਅੱਪ', 'ਸਥਾਨਕ ਕਾਰੋਬਾਰਾਂ ਲਈ ਕੀਵਰਡ ਖੋਜ', 'ਏਆਈ ਪ੍ਰੋੰਪਟ ਬਲੂਪ੍ਰਿੰਟ']
    },
    resources: [
      { title: 'ChatGPT 100+ Marketing Prompts Vault', type: 'pdf', size: '4.2 MB' },
      { title: 'Local SEO Audit Checklist', type: 'pdf', size: '1.9 MB' }
    ]
  },
  {
    id: 6,
    title: {
      en: 'Module 6: Freelancing, Client Retention & Scaling to ₹1 Lakh/Month',
      hi: 'मॉड्यूल 6: फ्रीलांसिंग, क्लाइंट प्रतिधारण और ₹1 लाख/माह तक स्केल करना',
      pa: 'ਮੋਡਿਊਲ 6: ਫ੍ਰੀਲਾਂਸਿੰਗ, ਗਾਹਕ ਬਣਾਉਣਾ ਅਤੇ ₹1 ਲੱਖ/ਮਹੀਨਾ ਤੱਕ ਪਹੁੰਚਣਾ'
    },
    description: {
      en: 'How to build your personal brand, create portfolios, list services on Upwork/Fiverr, retain monthly retainers, and scale to ₹1,00,00,000+ per year.',
      hi: 'अपना व्यक्तिगत ब्रांड कैसे बनाएं, पोर्टफोलियो बनाएं, अपवर्क/फाइवर पर सेवाएं सूचीबद्ध करें, मासिक रिटेनर बनाए रखें और प्रति वर्ष ₹1 लाख+ तक स्केल करें।',
      pa: 'ਆਪਣਾ ਨਿੱਜੀ ਬ੍ਰਾਂਡ ਕਿਵੇਂ ਬਣਾਉਣਾ ਹੈ, ਪੋਰਟਫੋਲੀਓ ਬਣਾਉਣਾ ਹੈ, ਅਪਵਰਕ/ਫਾਈਵਰ \'ਤੇ ਸੇਵਾਵਾਂ ਸੂਚੀਬੱਧ ਕਰਨੀਆਂ ਹਨ ਅਤੇ ਵਧਣਾ ਹੈ।'
    },
    duration: '1 hr 00 mins',
    lessonsCount: 5,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    topics: {
      en: ['Building a Standout Portfolio', 'Fiverr & Upwork Gig Optimization', 'Closing Retainer Clients ($500/mo)', 'Scaling into a Full Agency'],
      hi: ['एक शानदार पोर्टफोलियो बनाना', 'फाइवर और अपवर्क गिग अनुकूलन', 'मासिक रिटेनर क्लाइंट्स को बंद करना', 'पूर्ण एजेंसी में बदलना'],
      pa: ['ਸ਼ਾਨਦਾਰ ਪੋਰਟਫੋਲੀਓ ਬਣਾਉਣਾ', 'ਫਾਈਵਰ ਅਤੇ ਅਪਵਰਕ ਗਿਗ ਅਨੁਕੂਲਨ', 'ਮਹੀਨਾਵਾਰ ਗਾਹਕ ਬਣਾਉਣਾ', 'ਏਜੰਸੀ ਸ਼ੁਰੂ ਕਰਨਾ']
    },
    resources: [
      { title: 'Agency Pricing Calculator & Contract Template', type: 'template', size: '2.1 MB' },
      { title: 'ISO Course Certificate Request Guide', type: 'pdf', size: '1.0 MB' }
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Aman Singh',
    location: 'Chandigarh, Punjab',
    role: 'Freelated Web Developer & Marketer',
    rating: 5,
    earnings: 'Earned ₹85,000 in first month',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    comment: {
      en: 'I started freelancing after completing this course. The Foreign Client module was a game changer! Landed a US dental clinic website for $600 (₹50,000) within 3 weeks!',
      hi: 'इस कोर्स को पूरा करने के बाद मैंने फ्रीलांसिंग शुरू की। विदेशी क्लाइंट वाला मॉड्यूल कमाल का था! 3 सप्ताह के भीतर $600 (₹50,000) में यूएस डेंटल क्लिनिक की वेबसाइट मिली!',
      pa: 'ਇਸ ਕੋਰਸ ਤੋਂ ਬਾਅਦ ਮੈਂ ਫ੍ਰੀਲਾਂਸਿੰਗ ਸ਼ੁਰੂ ਕੀਤੀ। ਵਿਦੇਸ਼ੀ ਗਾਹਕਾਂ ਵਾਲਾ ਮੋਡਿਊਲ ਬਹੁਤ ਵਧੀਆ ਸੀ! 3 ਹਫ਼ਤਿਆਂ ਵਿੱਚ $600 ਦੀ ਵੈੱਬਸਾਈਟ ਦਾ ਕੰਮ ਮਿਲਿਆ!'
    }
  },
  {
    id: 2,
    name: 'Simran Kaur',
    location: 'Ludhiana, Punjab',
    role: 'Social Media Agency Owner',
    rating: 5,
    earnings: 'Managing 6 active client retainers',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    comment: {
      en: 'Best Digital Marketing course in Hindi and Punjabi. Everything explained practically step-by-step. The Meta ads strategy helped me land 6 boutique clients in Punjab!',
      hi: 'हिंदी और पंजाबी में सबसे बेहतरीन डिजिटल मार्केटिंग कोर्स। सब कुछ व्यावहारिक रूप से चरण-दर-चरण समझाया गया। मेटा एड्स रणनीति ने मुझे पंजाब में 6 बुटीक क्लाइंट प्राप्त करने में मदद की!',
      pa: 'ਹਿੰਦੀ ਅਤੇ ਪੰਜਾਬੀ ਵਿੱਚ ਸਭ ਤੋਂ ਵਧੀਆ ਡਿਜੀਟਲ ਮਾਰਕੀਟਿੰਗ ਕੋਰਸ। ਸਭ ਕੁਝ ਅਮਲੀ ਤੌਰ \'ਤੇ ਸਮਝਾਇਆ ਗਿਆ ਹੈ।'
    }
  },
  {
    id: 3,
    name: 'Rahul Sharma',
    location: 'Delhi NCR',
    role: 'E-commerce & Ads Specialist',
    rating: 5,
    earnings: 'Generated ₹3.2 Lakhs sales with Meta Ads',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    comment: {
      en: 'Worth much more than ₹99. I would easily pay ₹5,000+ for the quality of practical frameworks provided in the foreign client pitching module.',
      hi: '₹99 से कहीं अधिक मूल्यवान। विदेशी ग्राहक पिचिंग मॉड्यूल में प्रदान किए गए व्यावहारिक ढांचे की गुणवत्ता के लिए मैं आसानी से ₹5,000+ का भुगतान करूंगा।',
      pa: '₹99 ਤੋਂ ਬਹੁਤ ਜ਼ਿਆਦਾ ਕੀਮਤੀ। ਕੋਰਸ ਦੀ ਗੁਣਵੱਤਾ ਬਹੁਤ ਹੀ ਸ਼ਾਨਦਾਰ ਹੈ।'
    }
  },
  {
    id: 4,
    name: 'Harvinder Gill',
    location: 'Amritsar, Punjab',
    role: 'Digital Marketing Student',
    rating: 5,
    earnings: 'Closed $1,200 Australian Plumbing Client',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    comment: {
      en: 'I was hesitant at first because of ₹99 price, but the course is mindblowing! The cold email script in Module 4 got me an Australian plumbing company project for $1,200!',
      hi: '₹99 की कीमत के कारण मैं शुरू में झिझक रहा था, लेकिन कोर्स अद्भुत है! मॉड्यूल 4 की कोल्ड ईमेल स्क्रिप्ट ने मुझे $1,200 में ऑस्ट्रेलियाई प्लंबिंग कंपनी का प्रोजेक्ट दिलवाया!',
      pa: 'ਮੈਂ ਪਹਿਲਾਂ ₹99 ਦੀ ਕੀਮਤ ਕਰਕੇ ਸੋਚ ਰਿਹਾ ਸੀ, ਪਰ ਕੋਰਸ ਬਹੁਤ ਵਧੀਆ ਹੈ! ਮੋਡਿਊਲ 4 ਦੀ ਈਮੇਲ ਸਕ੍ਰਿਪਟ ਨਾਲ ਮੈਨੂੰ $1,200 ਦਾ ਪ੍ਰੋਜੈਕਟ ਮਿਲਿਆ!'
    }
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 1,
    question: {
      en: 'Is this course beginner friendly?',
      hi: 'क्या यह कोर्स शुरुआती लोगों के लिए उपयुक्त है?',
      pa: 'ਕੀ ਇਹ ਕੋਰਸ ਸ਼ੁਰੂਆਤੀ ਲੋਕਾਂ ਲਈ ਢੁਕਵਾਂ ਹੈ?'
    },
    answer: {
      en: 'Yes, 100%! The course is designed assuming zero prior knowledge. We start from basic fundamentals and gradually build up to advanced lead generation, web building, and foreign client closing.',
      hi: 'हां, 100%! यह कोर्स बिना किसी पूर्व ज्ञान को मानते हुए बनाया गया है। हम बुनियादी बातों से शुरुआत करते हैं और धीरे-धीरे उन्नत लीड जेनरेशन, वेब बिल्डिंग और विदेशी क्लाइंट क्लोजिंग तक पहुंचते हैं।',
      pa: 'ਹਾਂ, 100%! ਕੋਰਸ ਬਿਨਾਂ ਕਿਸੇ ਪਹਿਲੇ ਗਿਆਨ ਦੇ ਬਣਾਇਆ ਗਿਆ ਹੈ। ਅਸੀਂ ਬੁਨਿਆਦੀ ਗੱਲਾਂ ਤੋਂ ਸ਼ੁਰੂ ਕਰਦੇ ਹਾਂ ਅਤੇ ਹੌਲੀ-ਹੌਲੀ ਅੱਗੇ ਵਧਦੇ ਹਾਂ।'
    }
  },
  {
    id: 2,
    question: {
      en: 'Will I get lifetime access?',
      hi: 'क्या मुझे आजीवन पहुंच मिलेगी?',
      pa: 'ਕੀ ਮੈਨੂੰ ਉਮਰ ਭਰ ਦੀ ਪਹੁੰਚ ਮਿਲੇਗੀ?'
    },
    answer: {
      en: 'Yes! Once you pay ₹99, you get lifetime access to all 6 HD video modules, downloadable PDF templates, cold email scripts, and all future course updates for free.',
      hi: 'हां! एक बार जब आप ₹99 का भुगतान करते हैं, तो आपको सभी 6 HD वीडियो मॉड्यूल, डाउनलोड करने योग्य पीडीएफ टेम्पलेट, कोल्ड ईमेल स्क्रिप्ट और भविष्य के सभी कोर्स अपडेट मुफ्त में मिलते हैं।',
      pa: 'ਹਾਂ! ਇੱਕ ਵਾਰ ਜਦੋਂ ਤੁਸੀਂ ₹99 ਦਾ ਭੁਗਤਾਨ ਕਰਦੇ ਹੋ, ਤਾਂ ਤੁਹਾਨੂੰ ਸਾਰੇ ਵੀਡੀਓ ਮੋਡਿਊਲ ਅਤੇ ਟੈਂਪਲੇਟਸ ਤੱਕ ਉਮਰ ਭਰ ਦੀ ਪਹੁੰਚ ਮਿਲਦੀ ਹੈ।'
    }
  },
  {
    id: 3,
    question: {
      en: 'Is the course available in Hindi & Punjabi?',
      hi: 'क्या यह कोर्स हिंदी और पंजाबी में उपलब्ध है?',
      pa: 'ਕੀ ਇਹ ਕੋਰਸ ਹਿੰਦੀ ਅਤੇ ਪੰਜਾਬੀ ਵਿੱਚ ਉਪਲਬਧ ਹੈ?'
    },
    answer: {
      en: 'Yes! Punjab X Boom is a 3-Language course. You can switch video voiceover notes and explanations between English, Hindi (हिन्दी), and Punjabi (ਪੰਜਾਬੀ) anytime with a single click.',
      hi: 'हां! पंजाब X बूम एक 3-भाषा कोर्स है। आप एक क्लिक से अंग्रेजी, हिंदी (हिन्दी) और पंजाबी (ਪੰਜਾਬੀ) के बीच कभी भी स्विच कर सकते हैं।',
      pa: 'ਹਾਂ! ਪੰਜਾਬ X ਬੂਮ 3 ਭਾਸ਼ਾਵਾਂ ਵਾਲਾ ਕੋਰਸ ਹੈ। ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਸਮੇਂ ਅੰਗਰੇਜ਼ੀ, ਹਿੰਦੀ ਅਤੇ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲ ਸਕਦੇ ਹੋ।'
    }
  },
  {
    id: 4,
    question: {
      en: 'Can I watch on mobile phone?',
      hi: 'क्या मैं मोबाइल फोन पर देख सकता हूं?',
      pa: 'ਕੀ ਮੈਂ ਮੋਬਾਈਲ ਫੋਨ \'ਤੇ ਦੇਖ ਸਕਦਾ ਹਾਂ?'
    },
    answer: {
      en: 'Absolutely! Our player is 100% mobile optimized. You can stream video lessons on Android, iPhone, iPad, Laptop, or PC anytime on the go.',
      hi: 'बिल्कुल! हमारा प्लेयर 100% मोबाइल अनुकूलित है। आप चलते-फिरते एंड्रॉइड, आईफोन, आईपैड, लैपटॉप या पीसी पर वीडियो पाठ स्ट्रीम कर सकते हैं।',
      pa: 'ਬਿਲਕੁਲ! ਸਾਡਾ ਪਲੇਅਰ ਮੋਬਾਈਲ ਫੋਨਾਂ \'ਤੇ ਵਧੀਆ ਚੱਲਦਾ ਹੈ।'
    }
  },
  {
    id: 5,
    question: {
      en: 'How do I access the course after payment?',
      hi: 'भुगतान के बाद मैं कोर्स तक कैसे पहुंच सकता हूं?',
      pa: 'ਭੁਗਤਾਨ ਤੋਂ ਬਾਅਦ ਮੈਂ ਕੋਰਸ ਤੱਕ ਕਿਵੇਂ ਪਹੁੰਚ ਸਕਦਾ ਹਾਂ?'
    },
    answer: {
      en: 'Immediately after successful Razorpay payment, you will be redirected to the Student LMS Portal with instant access to all video modules, downloadable materials, and receipt.',
      hi: 'सफल रेजरपे भुगतान के तुरंत बाद, आपको सभी वीडियो मॉड्यूल, डाउनलोड करने योग्य सामग्री और रसीद तक त्वरित पहुंच के साथ छात्र एलएमएस पोर्टल पर भेज दिया जाएगा।',
      pa: 'ਸਫਲ ਭੁਗਤਾਨ ਤੋਂ ਬਾਅਦ, ਤੁਹਾਨੂੰ ਤੁਰੰਤ ਸਾਰੇ ਵੀਡੀਓ ਮੋਡਿਊਲਾਂ ਅਤੇ ਸਮੱਗਰੀ ਤੱਕ ਪਹੁੰਚ ਮਿਲੇਗੀ।'
    }
  },
  {
    id: 6,
    question: {
      en: 'Will I receive a course completion certificate?',
      hi: 'क्या मुझे कोर्स पूरा होने का प्रमाणपत्र मिलेगा?',
      pa: 'ਕੀ ਮੈਨੂੰ ਕੋਰਸ ਪੂਰਾ ਹੋਣ ਦਾ ਸਰਟੀਫਿਕੇਟ ਮਿਲੇਗਾ?'
    },
    answer: {
      en: 'Yes! Upon completing the course modules in your student dashboard, an ISO-verified shareable Certificate of Completion will be generated with your name, which you can download or print.',
      hi: 'हां! अपने छात्र डैशबोर्ड में कोर्स मॉड्यूल पूरा करने पर, आपके नाम के साथ एक आईएसओ-सत्यापित साझा करने योग्य पूर्णता प्रमाणपत्र तैयार किया जाएगा, जिसे आप डाउनलोड या प्रिंट कर सकते हैं।',
      pa: 'ਹਾਂ! ਕੋਰਸ ਪੂਰਾ ਕਰਨ ਤੋਂ ਬਾਅਦ, ਤੁਹਾਨੂੰ ਤੁਹਾਡੇ ਨਾਮ ਵਾਲਾ ਸਰਟੀਫਿਕੇਟ ਮਿਲੇਗਾ ਜੋ ਤੁਸੀਂ ਡਾਊਨਲੋਡ ਕਰ ਸਕਦੇ ਹੋ।'
    }
  }
];
