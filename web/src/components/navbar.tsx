'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  // Group categories into parent-children tree
  const rootCategories = dbCategories.length > 0 
    ? dbCategories.filter(c => !c.parent_id) 
    : [
        { name_ar: 'سياسة', slug: 'politics', id: 'politics' },
        { name_ar: 'اقتصاد', slug: 'economy', id: 'economy' },
        { name_ar: 'رياضة', slug: 'sports', id: 'sports' },
        { name_ar: 'تكنولوجيا', slug: 'tech', id: 'tech' },
        { name_ar: 'ثقافة', slug: 'culture', id: 'culture' },
        { name_ar: 'صحة', slug: 'health', id: 'health' },
      ];

  const getSubCategories = (parentId: string) => {
    if (dbCategories.length === 0) return [];
    return dbCategories.filter(c => c.parent_id === parentId);
  };

  return (
    <header className="sticky top-0 z-50 w-full" dir="rtl">
      {/* Ultra-Modern Glassmorphism Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-[40px] border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
        style={{
          background: 'linear-gradient(to left, #656666 0%, #656666 8%, rgba(101, 102, 102, 0.7) 22%, rgba(255, 255, 255, 0.9) 55%, #ffffff 75%, #ffffff 100%)'
        }}
      />

      {/* Top Bar: Editorial Info (Cinematic Style) */}
      <div className="relative bg-slate-950 text-white/90 py-2 px-6 text-[10px] font-black uppercase tracking-[0.4em] border-b border-white/5">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <span className="text-white">العدد الرقمي: 2026</span>
            <div className="w-px h-3 bg-white/20" />
            <span className="flex items-center gap-2 text-slate-300">
              <Globe className="w-3 h-3 text-primary" />
              {new Date().toLocaleDateString('en-GB')}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/live" className="text-white hover:text-primary transition-all flex items-center gap-2 group">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="group-hover:tracking-widest transition-all">بث مباشر</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-2.5">
        <div className="flex items-center justify-between gap-12">
          {/* Logo Section - Editorial Masterpiece */}
          <Link href="/" className="relative z-20 flex items-center gap-6 group shrink-0 mr-4 sm:mr-8">
            <div className="relative h-10 w-44 sm:h-14 sm:w-64 md:h-18 md:w-[30rem] lg:h-20 lg:w-[36rem] flex items-center justify-start">
              <Image
                src="/logo.png"
                alt="صحيفة المدى"
                fill
                priority
                sizes="(max-width: 768px) 200px, 500px"
                className="object-contain object-right transition-transform duration-200 group-hover:scale-115 p-0"
              />
            </div>
          </Link>

          {/* Main Navigation - Integrated Capsule Design */}
          <nav className="flex-1 hidden xl:flex items-center justify-center">
            <div className="flex items-center gap-2 p-1 bg-slate-950/5 backdrop-blur-3xl rounded-[2.5rem] border border-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
              <Link
                href="/"
                className="px-8 py-2.5 rounded-[2rem] bg-slate-950 text-white font-black text-xs shadow-2xl shadow-slate-950/40 hover:scale-105 transition-all whitespace-nowrap active:scale-95 animate-none"
              >
                الرئيسية
              </Link>

              <div className="flex items-center gap-1 px-6">
                {rootCategories.map((cat: any) => {
                  const subs = getSubCategories(cat.id);
                  const hasSubs = subs.length > 0;

                  if (!hasSubs) {
                    return (
                      <Link
                        key={cat.slug || cat.name_ar}
                        href={`/category/${cat.slug || cat.name_ar}`}
                        className="group relative px-5 py-2.5 text-slate-600 hover:text-slate-950 transition-all font-black text-[11px] whitespace-nowrap uppercase tracking-widest"
                      >
                        {cat.name_ar}
                        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary rounded-full group-hover:w-4 transition-all duration-500" />
                      </Link>
                    );
                  }

                  return (
                    <div 
                      key={cat.slug || cat.name_ar}
                      className="group relative"
                    >
                      <button
                        className="px-5 py-2.5 text-slate-600 hover:text-slate-950 transition-all font-black text-[11px] whitespace-nowrap uppercase tracking-widest flex items-center gap-1.5 focus:outline-none"
                      >
                        {cat.name_ar}
                        <span className="text-[8px] text-slate-400 select-none group-hover:rotate-180 transition-transform duration-300">▼</span>
                        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary rounded-full group-hover:w-4 transition-all duration-500" />
                      </button>

                      {/* Absolute Dropdown */}
                      <div className="absolute top-full right-0 mt-1 min-w-[180px] bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        <Link
                          href={`/category/${cat.slug || cat.name_ar}`}
                          className="block w-full text-right px-4 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all font-black"
                        >
                          كل {cat.name_ar}
                        </Link>
                        <div className="h-px bg-white/5 my-1" />
                        {subs.map((sub: any) => (
                          <Link
                            key={sub.slug || sub.name_ar}
                            href={`/category/${sub.slug || sub.name_ar}`}
                            className="block w-full text-right px-4 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all font-black"
                          >
                            {sub.name_ar}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
            className="xl:hidden fixed inset-0 top-[84px] sm:top-[100px] md:top-[110px] bg-white/90 z-[100] p-12 overflow-y-auto"
          >
            <div className="space-y-16">
              <div className="grid grid-cols-1 gap-8 font-black text-start">
                {rootCategories.map((cat: any, idx) => {
                  const subs = getSubCategories(cat.id);
                  const hasSubs = subs.length > 0;

                  return (
                    <motion.div
                      key={cat.slug || cat.name_ar}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="space-y-4"
                    >
                      <Link 
                        href={`/category/${cat.slug || cat.name_ar}`} 
                        onClick={() => setIsOpen(false)} 
                        className="group flex items-center gap-6 text-4xl hover:text-primary transition-all"
                      >
                        <span className="text-primary/20 group-hover:text-primary transition-colors">0{idx + 1}</span>
                        {cat.name_ar}
                      </Link>

                      {hasSubs && (
                        <div className="pr-12 space-y-3 flex flex-col border-r-2 border-slate-100 mr-4">
                          {subs.map((sub: any) => (
                            <Link 
                              key={sub.slug || sub.name_ar}
                              href={`/category/${sub.slug || sub.name_ar}`} 
                              onClick={() => setIsOpen(false)} 
                              className="text-2xl text-slate-500 hover:text-primary transition-all"
                            >
                              ↳ {sub.name_ar}
                            </Link>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
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
