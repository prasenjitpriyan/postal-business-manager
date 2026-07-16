import Link from 'next/link';
import { ArrowRight, Box, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-25%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-md bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Postal Manager</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/dashboard">
            <Button className="bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Go to Dashboard
            </Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-medium text-slate-300">Modernize your postal business workflow</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-4xl">
          Manage contributions with <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">absolute precision</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          The all-in-one management system designed to track officials, oversee contributions, and generate comprehensive reports seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:scale-105 group">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 w-full max-w-6xl px-4 text-left">
          <div className="flex flex-col items-start p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-slate-400 text-left">Optimized performance ensures your data is always ready when you need it.</p>
          </div>
          <div className="flex flex-col items-start p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure by Design</h3>
            <p className="text-slate-400 text-left">Enterprise-grade security keeps your officials&apos; data and contributions protected.</p>
          </div>
          <div className="flex flex-col items-start p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
              <Box className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Comprehensive Tracking</h3>
            <p className="text-slate-400 text-left">Monitor contributions across all offices from a single unified dashboard.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
