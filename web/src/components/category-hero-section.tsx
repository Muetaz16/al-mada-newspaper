'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface CategoryHeroSectionProps {
  title: string;
  slug: string;
  news: any[];
}

export function CategoryHeroSection({ title, slug, news }: CategoryHeroSectionProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!news || news.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % news.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [news]);

  if (!news || news.length === 0) {
    return null;
  }

  const current = news[currentIdx];

  return (
    <section className="space-y-6 pt-4 border-t border-white/5">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-6 bg-primary rounded-full" />
        <h3 className="text-2xl font-black text-white">{title}</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main Featured Card */}
        <div className="lg:col-span-8">
          <div className="group relative aspect-[16/9] md:aspect-auto md:min-h-[550px] rounded-xl overflow-hidden shadow-2xl transition-all duration-700 border border-white/10 bg-slate-950">
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 pointer-events-none"
              >
                <Image
                  src={current?.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'}
                  alt={current?.title || ''}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                  className="object-cover transition-transform duration-[10000ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1220] via-[#0c1220]/60 to-transparent" />
              </motion.div>
            </AnimatePresence>
            
            <div className="absolute top-6 right-6 z-10 pointer-events-none">
              <Badge className="bg-primary text-[#142038] font-black px-6 py-1.5 rounded-full text-xs uppercase tracking-widest shadow-xl">
                {current?.category?.name_ar || title}
              </Badge>
            </div>

            <Link href={`/news/${current?.slug}`} className="absolute bottom-8 right-8 left-8 space-y-4 text-start z-20 cursor-pointer block group/link">
              <h2 className="text-2xl md:text-5xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl group-hover/link:text-primary transition-colors">
                {current?.title}
              </h2>
              <p className="text-slate-300 font-medium text-sm md:text-base line-clamp-2 max-w-3xl leading-relaxed">
                {current?.summary}
              </p>
              
              <div className="flex items-center gap-4 text-slate-400 font-bold text-xs pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {current?.created_at ? new Date(current.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </div>
                <div className="w-px h-3 bg-slate-600" />
                <span>5 دقائق قراءة</span>
                <div className="w-px h-3 bg-slate-600" />
                <span className="text-primary">{current?.category?.name_ar || title}</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Side/Sub Headlines */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex flex-col gap-4 flex-1">
            {news.slice(1, 5).map((item) => (
              <div 
                key={item.id} 
                className="group flex gap-4 p-4 bg-[#101828] rounded-xl border border-white/5 hover:border-primary/30 shadow-lg transition-all duration-300 cursor-pointer"
              >
                {/* Side Thumbnail */}
                <div className="relative aspect-[4/3] w-36 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-white/10">
                  <Image
                    src={item.image_url || 'https://images.unsplash.com/photo-1611974717482-9828d28d1d8a'}
                    alt={item.title}
                    fill
                    sizes="120px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* News Details */}
                <div className="flex flex-col justify-between py-1 text-start flex-1 min-w-0">
                  <div className="space-y-1.5">
                    <span className="text-primary font-black text-[10px] tracking-wider block">
                      {item.category?.name_ar || title}
                    </span>
                    <Link href={`/news/${item.slug}`}>
                      <h4 className="text-sm font-black text-white/90 leading-snug line-clamp-2 group-hover:text-primary transition-colors tracking-tight">
                        {item.title}
                      </h4>
                    </Link>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Link href={`/category/${slug}`} className="w-full flex items-center justify-between px-6 py-3 border border-primary/50 rounded-xl hover:bg-primary/10 transition-all group">
             <span className="text-primary font-bold text-sm">عرض المزيد</span>
             <span className="text-primary text-lg">←</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
