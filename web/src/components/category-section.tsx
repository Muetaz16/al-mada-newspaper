'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategorySectionProps {
  title: string;
  items: any[];
  subCategories?: string[];
}

export function CategorySection({ title, items, subCategories = [] }: CategorySectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('الكل');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const getPreviewText = (item: any) => {
    if (item.summary) return item.summary;
    if (item.subtitle) return item.subtitle;
    if (item.seo_description) return item.seo_description;
    
    // Try to extract from content (handling both string and JSON)
    try {
      const content = item.content;
      if (!content) return '';
      
      if (typeof content === 'string') {
        return content.substring(0, 150) + '...';
      }
      
      // Handle Tiptap JSON structure (content.content) or standard blocks
      const blocks = content.content || content.blocks || (Array.isArray(content) ? content : null);
      
      if (Array.isArray(blocks)) {
        for (const block of blocks) {
          // If the block has its own content (like a paragraph)
          const nestedContent = block.content;
          if (Array.isArray(nestedContent)) {
            const textNode = nestedContent.find((n: any) => n.type === 'text');
            if (textNode && textNode.text) {
              return textNode.text.substring(0, 150) + '...';
            }
          }
          
          // Fallback for other structures
          const text = block.data?.text || block.text || '';
          if (text && typeof text === 'string') {
            const plainText = text.replace(/<[^>]*>?/gm, '');
            if (plainText.trim().length > 10) {
              return plainText.trim().substring(0, 150) + '...';
            }
          }
        }
      }
    } catch (e) {
      console.error('Error extracting preview text', e);
    }
    return '';
  };

  const filteredItems = useMemo(() => {
    if (activeCategory === 'الكل') return items;
    return items.filter(item => (item.category?.name_ar || item.category_name) === activeCategory);
  }, [activeCategory, items]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-8 py-12" dir="rtl">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-8 gap-6">
        <div className="flex items-center gap-8">
          <div className="relative">
            <h3 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">
              {title}
            </h3>
            <div className="absolute -bottom-2 right-0 w-12 h-1.5 bg-primary rounded-full" />
          </div>
          
          <nav className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide no-scrollbar">
            <button 
              onClick={() => setActiveCategory('الكل')}
              className={`px-5 py-2 rounded-full text-sm font-black transition-all ${
                activeCategory === 'الكل' 
                ? 'bg-slate-950 text-white shadow-xl shadow-slate-900/20' 
                : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              الكل
            </button>
            {subCategories.map((sub) => (
              <button 
                key={sub} 
                onClick={() => setActiveCategory(sub)}
                className={`px-5 py-2 rounded-full text-sm font-black transition-all whitespace-nowrap ${
                  activeCategory === sub 
                  ? 'bg-slate-950 text-white shadow-xl shadow-slate-900/20' 
                  : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                {sub}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-950 hover:text-white transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-950 hover:text-white transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="w-px h-8 bg-slate-100 mx-2" />
          <Link 
            href={activeCategory === 'الكل' ? '/news' : `/category/${encodeURIComponent(activeCategory)}`} 
            className="hidden md:flex items-center gap-3 text-slate-400 hover:text-primary font-black text-sm transition-all group"
          >
            مشاهدة الكل
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Horizontal Scrollable Content with Edge Fading */}
      <div className="relative group/scroll-container">
        {/* Left & Right Fading Gradients */}
        <div className="absolute left-0 top-0 bottom-12 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none opacity-0 group-hover/scroll-container:opacity-100 transition-opacity duration-500" />
        <div className="absolute right-0 top-0 bottom-12 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none opacity-0 group-hover/scroll-container:opacity-100 transition-opacity duration-500" />

        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-8 overflow-x-auto pb-12 pt-4 scroll-smooth snap-x snap-mandatory px-4 
            scrollbar-hide no-scrollbar
            ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}
          `}
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => {
              const previewText = getPreviewText(item);
              
              return (
                <motion.div
                  key={item.id || idx}
                  layout
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="min-w-[320px] md:min-w-[440px] lg:min-w-[540px] snap-center first:snap-start last:snap-end group/card"
                >
                  <div className="space-y-6 relative">
                    {/* Image Container (Non-clickable) */}
                    <div className="relative aspect-[16/10] rounded-[3.5rem] overflow-hidden shadow-[0_30px_70px_-15px_rgba(0,0,0,0.2)] group-hover/card:shadow-primary/30 transition-all duration-700 pointer-events-none ring-1 ring-slate-100">
                      <Image
                        src={item.image_url || 'https://images.unsplash.com/photo-1611974717482-9828d28d1d8a'}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-[6000ms] group-hover/card:scale-110"
                      />
                      
                      {/* Cinematic Shimmer Effect */}
                      <div className="absolute inset-0 animate-shimmer opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />
                      
                      {/* Cinematic Gradients */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-70 group-hover/card:opacity-90 transition-opacity duration-700" />
                      
                      {/* Floating Description Overlay (Enhanced Glassmorphism) */}
                      <div className="absolute inset-x-8 bottom-8 translate-y-6 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-700 z-20">
                        <div className="bg-slate-950/40 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl">
                          <p className="text-white text-sm font-bold leading-relaxed line-clamp-3">
                            {previewText || 'اضغط لمتابعة كافة المستجدات وتحليل الأحداث الجارية بالتفصيل عبر منصة المدى.'}
                          </p>
                        </div>
                      </div>

                      {/* Category Badge (Cinematic Style) */}
                      <div className="absolute top-10 right-10 z-20">
                        <div className="bg-primary/95 backdrop-blur-md px-6 py-2.5 rounded-2xl shadow-2xl border border-white/20">
                          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                            {item.category?.name_ar || item.category_name || 'المدى'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Title & Meta (Clickable) */}
                    <Link href={`/news/${item.slug || item.id}`} className="block space-y-5 text-start px-8 cursor-pointer group/title">
                      <div className="flex items-center gap-5 text-[10px] font-black text-slate-400">
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-slate-900">{new Date(item.created_at).toLocaleDateString('en-GB')}</span>
                        </div>
                        <div className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
                        <span className="uppercase tracking-[0.3em] text-primary/60">تحقيق خاص</span>
                      </div>
                      
                      <div className="relative inline-block">
                        <h4 className="text-3xl md:text-4xl font-black text-slate-950 leading-[1.1] group-hover/card:text-primary transition-all duration-300 tracking-tighter line-clamp-2">
                          {item.title}
                        </h4>
                        <span className="absolute -bottom-2 right-0 w-0 h-1.5 bg-primary/20 rounded-full group-hover/card:w-full transition-all duration-700" />
                      </div>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
