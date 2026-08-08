'use client';

import Link from 'next/link';
import { ArrowLeft, Scale, CheckCircle2, ShieldAlert, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostalLogo } from '@/components/brand/PostalLogo';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 selection:bg-blue-500/30 relative">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[60%] rounded-full bg-blue-900/20 blur-[130px]" />
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
          <Scale className="w-4 h-4" />
          Terms of Use & Compliance
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mb-10">
          Effective Date: August 2026 • Official Platform Usage Agreement
        </p>

        <div className="space-y-10 text-slate-300 leading-relaxed text-sm sm:text-base">
          <section className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-white">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              1. Acceptance of Terms
            </div>
            <p>
              By accessing or using Postal Business Manager, authorized personnel agree to abide by these Terms of Service and comply with all applicable departmental guidelines and government regulations.
            </p>
          </section>

          <section className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-white">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <UserCheck className="w-5 h-5" />
              </div>
              2. Role-Based Account Privileges
            </div>
            <p>
              Access to system features is regulated by account roles assigned by designated Administrators:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li><strong className="text-white">Super Admin Privileges:</strong> Full project ownership with rights to assign Super Admin, Admin, or Viewer roles and perform project handover.</li>
              <li><strong className="text-white">Admin Privileges:</strong> Authorized to create, edit, or delete official records and manage user role promotions/demotions for Administrators and Viewers.</li>
              <li><strong className="text-white">Viewer Privileges:</strong> Read-only authorization to view dashboards, analytical reports, and export CSV files without data mutation capabilities.</li>
            </ul>
          </section>

          <section className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-white">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              3. User Conduct & Record Accuracy
            </div>
            <p>
              Users are responsible for ensuring the precision and authenticity of all logged account opening contributions, insurance sum assured figures, and official details. Falsification or unauthorized tampering with system records is strictly prohibited.
            </p>
          </section>

          <section className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white">4. Availability & Modifications</h3>
            <p>
              Postal Business Manager reserves the right to perform scheduled system maintenance, update operational features, and modify these Terms to ensure ongoing security and departmental compliance.
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
