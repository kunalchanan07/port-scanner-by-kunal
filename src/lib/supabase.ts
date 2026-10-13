import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_ID = 'bnbamkljosokecwkrihh';
const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_nqu9PTY9yUEbOPMGbVWNtg_IfDX64tN';

function getValidUrl(rawUrl: unknown): string {
  if (typeof rawUrl !== 'string') return DEFAULT_SUPABASE_URL;
  const trimmed = rawUrl.trim();
  if (!trimmed) return DEFAULT_SUPABASE_URL;

  // If already full http(s) URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return DEFAULT_SUPABASE_URL;
    }
  }

  // Handle case where URL might be missing protocol, e.g. "bnbamkljosokecwkrihh.supabase.co" or "bnbamkljosokecwkrihh"
  const formatted = `https://${trimmed.includes('.') ? trimmed : `${trimmed}.supabase.co`}`;
  try {
    new URL(formatted);
    return formatted;
  } catch {
    return DEFAULT_SUPABASE_URL;
  }
}

function getValidKey(rawKey: unknown): string {
  if (typeof rawKey !== 'string') return DEFAULT_SUPABASE_ANON_KEY;
  const trimmed = rawKey.trim();
  return trimmed || DEFAULT_SUPABASE_ANON_KEY;
}

const rawEnvUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const rawEnvKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const supabaseUrl = getValidUrl(rawEnvUrl);
export const supabaseAnonKey = getValidKey(rawEnvKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface EnrollmentRecord {
  id?: string;
  name: string;
  email: string;
  phone: string;
  amount?: number;
  payment_method?: string;
  status?: string;
  created_at?: string;
}

export interface ReviewRecord {
  id?: string;
  name: string;
  module_title: string;
  rating: number;
  comment: string;
  role?: string;
  location?: string;
  earnings?: string;
  created_at?: string;
}

export async function saveEnrollment(record: EnrollmentRecord) {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .insert([
        {
          name: record.name,
          email: record.email,
          phone: record.phone,
          amount: record.amount || 99,
          payment_method: record.payment_method || 'UPI',
          status: record.status || 'completed',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.warn('Supabase insertion error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to save to Supabase:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

export async function fetchEnrollments() {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data as EnrollmentRecord[] };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch', data: [] };
  }
}

export async function saveReview(review: ReviewRecord) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          name: review.name,
          module_title: review.module_title,
          rating: review.rating,
          comment: review.comment,
          role: review.role || 'Verified Student',
          location: review.location || 'Punjab, India',
          earnings: review.earnings || '',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.warn('Supabase review error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to save review:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

export async function fetchReviews() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data as ReviewRecord[] };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch reviews', data: [] };
  }
}
