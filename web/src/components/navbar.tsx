'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu, X, Play, Film, Mic2, Tv, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name_ar');
      if (data) setDbCategories(data);
    }
    fetchCategories();
  }, [supabase]);

  const navCategories = dbCategories.length > 0 ? dbCategories : [
    { name_ar: 'سياسة', slug: 'politics' },
    { name_ar: 'اقتصاد', slug: 'economy' },
    { name_ar: 'رياضة', slug: 'sports' },
    { name_ar: 'تكنولوجيا', slug: 'tech' },
    { name_ar: 'ثقافة', slug: 'culture' },
    { name_ar: 'صحة', slug: 'health' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full" dir="rtl">
      {/* Ultra-Modern Glassmorphism Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-[40px] border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
        style={{
          background: 'linear-gradient(to left, #656666 0%, #656666 8%, rgba(101, 102, 102, 0.7) 22%, rgba(255, 255, 255, 0.9) 55%, #ffffff 75%, #ffffff 100%)'
        }}
      />

      {/* Top Bar: Site title with logo on black background */}
      <div className="relative bg-black text-white/90 py-2.5 px-4 sm:px-6 border-b border-white/5">
        <div className="container mx-auto flex items-center justify-between gap-4 min-h-12">
          <div className="hidden sm:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.35em] shrink-0">
            <span>العدد الرقمي: 2026</span>
            <div className="w-px h-3 bg-white/20" />
            <span className="flex items-center gap-2 text-slate-300">
              <Globe className="w-3 h-3 text-primary" />
              {new Date().toLocaleDateString('en-GB')}
            </span>
          </div>

          <Link
            href="/"
            className="relative z-20 flex items-center justify-center group shrink-0 mx-auto sm:mx-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2"
          >
            <div className="relative h-9 w-36 sm:h-11 sm:w-52 md:h-12 md:w-60">
              <Image
                src="/logo.png"
                alt="المدى — نحو الخبر اليقين"
                fill
                priority
                sizes="(max-width: 640px) 160px, 240px"
                className="object-contain object-center transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </Link>

          <div className="flex items-center gap-4 shrink-0 ms-auto sm:ms-0">
            <Link href="/live" className="text-white hover:text-primary transition-all flex items-center gap-2 group text-[10px] font-black uppercase tracking-[0.35em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="group-hover:tracking-widest transition-all">بث مباشر</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-2.5">
        <div className="flex items-center justify-center gap-12">
          {/* Main Navigation - Integrated Capsule Design */}
          <nav className="flex-1 hidden xl:flex items-center justify-center max-w-5xl">
            <div className="flex items-center gap-2 p-1 bg-slate-950/5 backdrop-blur-3xl rounded-[2.5rem] border border-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
              <Link
                href="/"
                className="px-8 py-2.5 rounded-[2rem] bg-slate-950 text-white font-black text-xs shadow-2xl shadow-slate-950/40 hover:scale-105 transition-all whitespace-nowrap active:scale-95"
              >
                الرئيسية
              </Link>

              <div className="flex items-center gap-1 px-6">
                {navCategories.map((cat: any) => (
                  <Link
                    key={cat.slug || cat.name_ar}
                    href={`/category/${cat.slug || cat.name_ar}`}
                    className="group relative px-5 py-2.5 text-slate-600 hover:text-slate-950 transition-all font-black text-[11px] whitespace-nowrap uppercase tracking-widest"
                  >
                    {cat.name_ar}
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary rounded-full group-hover:w-4 transition-all duration-500" />
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Actions - High End Interactions */}
          <div className="flex items-center gap-4">
            <button
              className="xl:hidden p-3 bg-slate-950 text-white rounded-2xl shadow-2xl hover:bg-primary transition-all active:scale-90"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Cinematic Portal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(40px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="xl:hidden fixed inset-0 top-[7.5rem] sm:top-[8rem] bg-white/90 z-[100] p-12 overflow-y-auto"
          >
            <div className="space-y-16">
              <div className="grid grid-cols-1 gap-10 font-black text-4xl text-start">
                {navCategories.map((cat: any, idx) => (
                  <motion.div
                    key={cat.slug || cat.name_ar}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={`/category/${cat.slug || cat.name_ar}`} onClick={() => setIsOpen(false)} className="group flex items-center gap-6 hover:text-primary transition-all">
                      <span className="text-primary/20 group-hover:text-primary transition-colors">0{idx + 1}</span>
                      {cat.name_ar}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="pt-10 border-t border-slate-100">
                <Button nativeButton={false} render={<Link href="/live" onClick={() => setIsOpen(false)} />} className="w-full h-16 rounded-[1.75rem] bg-primary hover:bg-primary/95 text-white font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all">بث مباشر</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
