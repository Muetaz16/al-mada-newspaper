'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Zap } from 'lucide-react';

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
    <div className="bg-[#101828] text-white h-14 overflow-hidden flex items-stretch relative z-40 border-b border-white/5" dir="rtl">
      <div 
        className="bg-primary px-8 h-full flex items-center justify-center gap-2 font-black text-sm md:text-base uppercase z-20 text-[#142038]"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 15% 100%)', minWidth: '120px' }}
      >
        <Zap className="w-4 h-4 fill-[#142038] animate-pulse" />
        <span className="pr-1 pl-4">عاجل</span>
      </div>
      <div className="flex-1 whitespace-nowrap h-full flex items-center pl-4">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            repeat: Infinity,
            duration: Math.max(40, news.reduce((acc, item) => acc + item.length, 0) * 0.2), // Adjust duration based on total text length so it doesn't get too fast
            ease: 'linear',
          }}
          className="flex gap-12 items-center"
        >
          {news.map((item, i) => (
            <div key={i} className="flex items-center gap-12">
              <span className="font-bold text-sm text-slate-200">
                {item}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {news.map((item, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-12">
              <span className="font-bold text-sm text-slate-200">
                {item}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
