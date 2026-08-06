'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostalLogo } from '@/components/brand/PostalLogo';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 selection:bg-blue-500/30 relative">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[130px]" />
        <div className="absolute top-[30%] right-[-10%] w-[45%] h-[60%] rounded-full bg-indigo-900/20 blur-[130px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-5 border-b border-white/10 backdrop-blur-md bg-slate-950/60">
        <PostalLogo size="md" />
        <Link href="/">
          <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 text-xs sm:text-sm font-semibold rounded-full px-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-6 py-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4" />
          Privacy & Data Protection
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mb-10">
          Last updated: August 2026 • Official Data Governance Guidelines
        </p>

        <div className="space-y-10 text-slate-300 leading-relaxed text-sm sm:text-base">
          <section className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-white">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              1. Information We Collect
            </div>
            <p>
              Postal Business Manager collects official departmental data necessary for operating postal metrics, tracking official contributions, and administering Postal Life Insurance (PLI) and Rural Postal Life Insurance (RPLI) records.
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>Official Identifiers: Name, designation, assigned office location, and departmental email.</li>
              <li>Policy Records: Policy type (PLI / RPLI), office of indexing, sum assured values, and initial premium collections.</li>
              <li>Account Metrics: Daily savings account openings and deposit category totals.</li>
            </ul>
          </section>

          <section className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-white">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Eye className="w-5 h-5" />
              </div>
              2. How We Use Collected Data
            </div>
            <p>
              Collected data is processed exclusively for official business administrative purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>Generating real-time departmental analytical reports and monthly performance leaderboards.</li>
              <li>Enforcing strict Role-Based Access Control (Admin vs. Viewer authorization).</li>
              <li>Auditing business contribution accuracy and insurance policy distributions.</li>
            </ul>
          </section>

          <section className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-white">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              3. Data Security & Confidentiality
            </div>
            <p>
              We implement enterprise-grade security protocols to protect all operational data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>JWT (JSON Web Token) session encryption for all API communications.</li>
              <li>Bcrypt cryptographic password hashing for account authentication.</li>
              <li>Strict non-disclosure: No departmental data is sold or shared with external third parties.</li>
            </ul>
          </section>

          <section className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white">4. User Rights & Data Retention</h3>
            <p>
              Authorized personnel may request correction or deletion of erroneous official records through designated System Administrators via the administrative user access panel.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/40 backdrop-blur-md py-8 px-8 mt-auto text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Postal Business Manager. All rights reserved.
      </footer>
    </div>
  );
}
