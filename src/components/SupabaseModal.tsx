import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, Copy, Check, ExternalLink, RefreshCw, X, Shield, Plus, Server } from 'lucide-react';
import { supabaseUrl, supabaseAnonKey, fetchEnrollments, saveEnrollment, EnrollmentRecord } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [records, setRecords] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const sqlSchema = `-- Copy and paste this into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bnbamkljosokecwkrihh/sql

-- 1. Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    amount NUMERIC DEFAULT 99,
    payment_method TEXT DEFAULT 'UPI',
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS & Policies for Enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts enrollments" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select enrollments" ON public.enrollments FOR SELECT USING (true);

-- 2. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    module_title TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    comment TEXT NOT NULL,
    role TEXT DEFAULT 'Verified Student',
    location TEXT DEFAULT 'Punjab, India',
    earnings TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS & Policies for Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select reviews" ON public.reviews FOR SELECT USING (true);
`;

  const loadData = async () => {
    setLoading(true);
    setFetchError(null);
    const res = await fetchEnrollments();
    if (res.success) {
      setRecords(res.data);
    } else {
      setFetchError(res.error || 'Failed to fetch records. Make sure the "enrollments" table exists in your Supabase project.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [isOpen]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleAddTestRecord = async () => {
    setLoading(true);
    const result = await saveEnrollment({
      name: 'Kunal Chanan (Test Student)',
      email: 'kunalchanan07@gmail.com',
      phone: '+91 9876543210',
      amount: 99,
      payment_method: 'UPI (GPAY)',
      status: 'completed'
    });

    if (result.success) {
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
      loadData();
    } else {
      alert(`Could not insert record. Make sure table is created in Supabase SQL editor.\nError: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#121212] border border-[#39FF14]/40 text-white shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">Supabase Connected</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#39FF14]/20 text-[#39FF14] text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" /> Live DB
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              All user details and ₹99 payment enrollments automatically sync to your Supabase project.
            </p>
          </div>
        </div>

        {/* Project Credentials Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 text-xs">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase tracking-wider font-bold">Supabase Project ID</span>
            <span className="font-mono font-bold text-[#FFD400]">bnbamkljosokecwkrihh</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase tracking-wider font-bold">API Access Key</span>
            <span className="font-mono font-bold text-neutral-300 truncate block">{supabaseAnonKey.slice(0, 20)}...</span>
          </div>
        </div>

        {/* SQL Schema Code Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#FFD400]" /> SQL Table Setup Script
            </span>
            <button
              onClick={handleCopySql}
              className="px-3 py-1 rounded-xl bg-[#FFD400] text-black font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#e6be00] transition cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied SQL!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy SQL Code
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-[#080808] border border-white/10 text-[11px] font-mono text-neutral-300 overflow-x-auto leading-relaxed selection:bg-[#39FF14] selection:text-black">
            {sqlSchema}
          </pre>
          <a
            href="https://supabase.com/dashboard/project/bnbamkljosokecwkrihh/sql"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#39FF14] hover:underline font-bold"
          >
            <span>Open Supabase SQL Editor Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Payment Records Section */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-white">
                Saved Payments in Supabase ({records.length})
              </h4>
              <button
                onClick={loadData}
                disabled={loading}
                className="p-1 rounded-lg text-neutral-400 hover:text-white transition cursor-pointer"
                title="Refresh from Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleAddTestRecord}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Test Payment Record
            </button>
          </div>

          {testSuccess && (
            <div className="p-3 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Test record successfully written to Supabase!
            </div>
          )}

          {fetchError && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
              <span className="font-bold block">Table "enrollments" Notice:</span>
              <p className="text-neutral-300">
                If you haven't run the SQL snippet above in your Supabase dashboard yet, click "Copy SQL Code" above and execute it in your Supabase SQL Editor.
              </p>
            </div>
          )}

          {/* Table List */}
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#161616]">
            {records.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400">
                No payments saved yet. Complete a ₹99 checkout or click "Add Test Payment Record" above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1D1D1D] text-neutral-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {records.map((r, idx) => (
                      <tr key={r.id || idx} className="hover:bg-white/5 transition">
                        <td className="p-3 font-bold text-white">{r.name}</td>
                        <td className="p-3 font-mono text-neutral-300">{r.email}</td>
                        <td className="p-3 font-mono text-neutral-400">{r.phone}</td>
                        <td className="p-3 text-neutral-300">{r.payment_method || 'UPI'}</td>
                        <td className="p-3 font-bold text-[#39FF14]">₹{r.amount || 99}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-[#39FF14]/20 text-[#39FF14] text-[10px] font-black uppercase">
                            {r.status || 'completed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
