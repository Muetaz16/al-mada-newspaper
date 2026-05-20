'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { AlertCircle, Zap } from 'lucide-react';

export function BreakingNewsTicker() {
  const [news, setNews] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchBreaking() {
      // Fetch from the new dedicated table
      const { data } = await supabase
        .from('breaking_news')
        .select('text')
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (data && data.length > 0) {
        setNews(data.map((item: any) => item.text));
      } else {
        setNews(['المدى نيوز: تابع تغطيتنا المستمرة على مدار الساعة لمختلف الأحداث والمستجدات الحصرية.']);
      }
    }
    fetchBreaking();
    
    // Refresh every minute
    const interval = setInterval(fetchBreaking, 60000);
    return () => clearInterval(interval);
  }, [supabase]);

  return (
    <div className="bg-slate-950 text-white h-16 overflow-hidden flex items-stretch relative z-40 shadow-[0_10px_40px_rgba(24,113,185,0.3)] border-y border-white/5" dir="rtl">
      <div className="bg-slate-950 px-12 h-full flex items-center gap-4 font-black text-lg uppercase tracking-widest z-20 shadow-[20px_0_40px_rgba(0,0,0,0.4)] relative">
        <div className="relative">
          <Zap className="w-5 h-5 text-primary fill-primary animate-pulse" />
          <div className="absolute inset-0 bg-primary/40 blur-xl animate-ping rounded-full" />
        </div>
        عاجل
        <div className="absolute top-0 right-0 bottom-0 w-px bg-white/10" />
      </div>
      <div className="flex-1 whitespace-nowrap h-full flex items-center bg-[#1871b9]">
        <motion.div
          animate={{ x: ['100%', '-100%'] }}
          transition={{
            repeat: Infinity,
            duration: 50,
            ease: 'linear',
          }}
          className="flex gap-20"
        >
          {news.map((item, i) => (
            <span key={i} className="font-black text-lg md:text-xl flex items-center gap-6">
              {item}
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {news.map((item, i) => (
            <span key={`dup-${i}`} className="font-black text-lg md:text-xl flex items-center gap-6">
              {item}
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
