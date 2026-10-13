export type Language = 'en' | 'hi' | 'pa';

export interface ModuleResource {
  title: string;
  type: 'pdf' | 'script' | 'template' | 'link';
  size?: string;
}

export interface VideoModule {
  id: number;
  title: Record<Language, string>;
  description: Record<Language, string>;
  duration: string;
  lessonsCount: number;
  videoUrl: string;
  thumbnail: string;
  topics: Record<Language, string[]>;
  resources: ModuleResource[];
  isSpecialForeignModule?: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  role: string;
  rating: number;
  comment: Record<Language, string>;
  avatar: string;
  earnings?: string;
}

export interface FAQItem {
  id: number;
  question: Record<Language, string>;
  answer: Record<Language, string>;
}

export interface PaymentDetails {
  method: 'upi' | 'card' | 'netbanking' | 'wallet';
  upiId?: string;
  upiApp?: string;
  phone: string;
  email: string;
  name: string;
}
