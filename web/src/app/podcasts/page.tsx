'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { PodcastSection } from '@/components/podcast-section';
import { Mic, Sparkles } from 'lucide-react';

export default function PodcastsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary/20" dir="rtl">
      <Navbar />
      
      {/* Editorial Light Accent Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 py-20 space-y-12 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-slate-200/60 pb-16 text-start">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10 shadow-sm">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <span className="text-primary font-black text-sm uppercase tracking-[0.4em]">مرئي المدى</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-slate-950">مكتبة البرودكاست</h1>
            <p className="text-slate-600 font-bold text-xl max-w-3xl italic leading-relaxed">
              شاهد واستمع إلى أعمق التحليلات، والحوارات الحصرية عبر سلسلة برامجنا المرئية المتنوعة (البرودكاست).
            </p>
          </div>
        </header>

        {/* Podcast Player embedded with full list */}
        <div className="bg-slate-950 rounded-[4rem] p-4 md:p-8 shadow-2xl">
          <PodcastSection showAll={true} />
        </div>

      </div>
      
      <Footer />
    </main>
  );
}
