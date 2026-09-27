'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle2, GitBranch, Code2, Zap } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200 ${
      isDark ? 'bg-[#070B14] text-slate-100' : 'bg-[#F4F5F7] text-slate-900'
    }`}>
      {/* Top Header Navbar */}
      <header className={`border-b sticky top-0 z-50 px-8 py-4 flex items-center justify-between backdrop-blur-md transition-colors ${
        isDark ? 'border-slate-800 bg-[#0D1321]/80' : 'border-slate-200/80 bg-white/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-md text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className={`text-xl font-extrabold tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ReviewPulse
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Link href="#features" className="hover:text-blue-500 transition">Services</Link>
          <Link href="#workflow" className="hover:text-blue-500 transition">Workflow</Link>
          <Link href="#architecture" className="hover:text-blue-500 transition">Architecture</Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link href="/login" className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
            isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-blue-600'
          }`}>
            Sign In
          </Link>
          <Link href="/register" className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg transition flex items-center gap-2 ${
            isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}>
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        {/* Top Tagline */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase font-bold">
            PROFESSIONAL CODE DETAILING
          </span>
          <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
            (EST. 2026)
          </span>
        </div>

        {/* Big Bold Headline */}
        <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-4xl mb-8 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Flawless Audits <br /> For Your Repository
        </h1>

        <p className={`text-sm md:text-base max-w-2xl mb-12 leading-relaxed font-normal ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          A meticulous developer code review experience designed to restore repository health, surface security flaws, optimize performance, and bring every line of code back to life.
        </p>

        {/* Hero Card & Interactive Graphic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch mb-20">
          {/* Left Electric Blue Hero Highlight Card */}
          <div className="md:col-span-5 bg-blue-600 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4">
              <span className="text-[10px] font-mono tracking-widest text-blue-200 uppercase font-bold bg-blue-700/60 px-3 py-1 rounded-full w-fit block">
                SAVOR THE CODE QUALITY
              </span>
              <h3 className="text-3xl font-extrabold leading-tight">
                Restore the Health. <br /> Elevate the Code.
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Automated multi-source ingestion for ZIP archives, drag-and-drop folders, and GitHub repositories.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-blue-500/60 flex items-center justify-between">
              <Link href="/register" className="px-5 py-2.5 bg-white text-blue-600 rounded-full font-bold text-xs hover:bg-blue-50 transition flex items-center gap-2 shadow-md">
                Explore Audits <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-[10px] font-mono text-blue-200">100% PRODUCTION READY</span>
            </div>
          </div>

          {/* Right Preview Grid Cards */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={`border rounded-3xl p-6 shadow-sm transition ${
              isDark ? 'bg-[#0D1321] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${
                isDark ? 'bg-slate-800 text-blue-400' : 'bg-slate-100 text-slate-900'
              }`}>
                <GitBranch className="w-5 h-5" />
              </div>
              <h4 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Multi-Source Import</h4>
              <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ZIP Upload, drag & drop folders, or GitHub repository URL fetching.
              </p>
              <span className="text-[10px] font-mono text-blue-500 font-bold uppercase">01 / FAST INGESTION</span>
            </div>

            <div className={`border rounded-3xl p-6 shadow-sm transition ${
              isDark ? 'bg-[#0D1321] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>3-Panel IDE Inspector</h4>
              <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Unified File Tree, Code Previewer, and Actionable AI Findings.
              </p>
              <span className="text-[10px] font-mono text-blue-500 font-bold uppercase">02 / DEEP INSPECTION</span>
            </div>

            <div className={`border rounded-3xl p-6 shadow-sm transition sm:col-span-2 ${
              isDark ? 'bg-[#0D1321] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Actionable Diff Patches & Fixes</h4>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase">
                  NEW FEATURE
                </span>
              </div>
              <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Click "Show Fix" to inspect side-by-side or unified code diff patches (`- original` vs `+ fixed`), copy fixes directly, and track resolution status.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Dark Contrast Section */}
        <div className={`rounded-3xl p-10 shadow-2xl border flex flex-col md:flex-row items-center justify-between gap-8 ${
          isDark ? 'bg-[#111827] border-slate-800 text-white' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-2">
              SAVOR THE EXPERIENCE
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Your Code Deserves <br /> More Than a Quick Review.
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center">
              <span className="text-2xl font-extrabold text-white block">98%</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Detection Accuracy</span>
            </div>
            <Link href="/register" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition flex items-center gap-2">
              Start Free Audit <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <footer className={`border-t px-8 py-6 text-center text-xs font-mono ${
        isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'
      }`}>
        ReviewPulse &bull; Professional Code Detailing Platform &bull; (SINCE 2026)
      </footer>
    </div>
  );
}
