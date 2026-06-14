'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Heart, ArrowUpLeft, Mail, Phone, MapPin } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name_ar');
      if (data) setDbCategories(data);
    }
    fetchCategories();
  }, [supabase]);

  const categoriesToRender = dbCategories.length > 0 ? dbCategories : [
    { name_ar: 'سياسة', slug: 'politics' },
    { name_ar: 'اقتصاد', slug: 'economy' },
    { name_ar: 'رياضة', slug: 'sports' },
    { name_ar: 'تكنولوجيا', slug: 'tech' },
    { name_ar: 'ثقافة', slug: 'culture' },
    { name_ar: 'صحة', slug: 'health' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white border-t border-white/10 pt-24 pb-12 overflow-hidden" dir="rtl">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 right-10 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] opacity-60" />
        <div className="absolute top-0 left-10 w-[250px] h-[250px] bg-blue-600/5 rounded-full blur-[80px] opacity-40" />
      </div>

      <div className="relative z-10 container mx-auto px-6 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/5 text-start">
          
          {/* Branding Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              <h4 className="text-4xl md:text-5xl font-black tracking-tighter text-white">صحيفة المدى</h4>
            </div>
            <p className="text-slate-400 font-bold text-sm leading-relaxed max-w-sm">
              أول منصة رقمية متكاملة تأخذك إلى أبعد مدى في عالم الخبر والتحليل والمعرفة. تغطية شاملة وحصرية على مدار الساعة بأحدث التقنيات الرقمية.
            </p>
            <div className="flex items-center gap-4 text-xs font-black text-slate-500 uppercase tracking-widest pt-2">
              <span>العدد الرقمي: 2026</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>ليبيا</span>
            </div>
          </div>

          {/* Main Links Column */}
          <div className="md:col-span-3 space-y-6">
            <h5 className="text-white font-black text-xs uppercase tracking-[0.2em] border-r-2 border-primary pr-3">محتوى المنصة</h5>
            <div className="flex flex-col gap-4 font-bold text-sm text-slate-400">
              <Link href="/" className="text-slate-400 hover:text-white hover:translate-x-[-4px] transition-all flex items-center gap-1.5">
                الرئيسية
                <ArrowUpLeft className="w-3.5 h-3.5 opacity-0 hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/news" className="text-slate-400 hover:text-white hover:translate-x-[-4px] transition-all flex items-center gap-1.5">
                شريط الأخبار
                <ArrowUpLeft className="w-3.5 h-3.5 opacity-0 hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/videos" className="text-slate-400 hover:text-white hover:translate-x-[-4px] transition-all flex items-center gap-1.5">
                الوسائط
                <ArrowUpLeft className="w-3.5 h-3.5 opacity-0 hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/reels" className="text-slate-400 hover:text-white hover:translate-x-[-4px] transition-all flex items-center gap-1.5">
                ريلز
                <ArrowUpLeft className="w-3.5 h-3.5 opacity-0 hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Sections Column */}
          <div className="md:col-span-4 space-y-6">
            <h5 className="text-white font-black text-xs uppercase tracking-[0.2em] border-r-2 border-primary pr-3">أقسام التغطية</h5>
            <div className="grid grid-cols-2 gap-4 font-bold text-sm text-slate-400">
              {categoriesToRender.map((cat: any) => (
                <Link
                  key={cat.slug || cat.name_ar}
                  href={`/category/${cat.slug || cat.name_ar}`}
                  className="text-slate-400 hover:text-white hover:translate-x-[-4px] transition-all"
                >
                  {cat.name_ar}
                </Link>
              ))}
            </div>
          </div>

        </div>


      </div>
    </footer>
  );
}
