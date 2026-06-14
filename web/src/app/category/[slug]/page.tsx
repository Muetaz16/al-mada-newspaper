'use client';

import { useState, useEffect, use } from 'react';
import { Navbar } from '@/components/navbar';
import { BreakingNewsTicker } from '@/components/breaking-news';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/footer';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [news, setNews] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      const decodedSlug = decodeURIComponent(slug);
      let catData: any = null;

      // 1. Try fetching by raw slug
      const { data: byRawSlug } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      catData = byRawSlug;

      // 2. Try fetching by decoded slug
      if (!catData && decodedSlug !== slug) {
        const { data: byDecodedSlug } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', decodedSlug)
          .maybeSingle();
        catData = byDecodedSlug;
      }

      // 3. Try fetching by name_ar
      if (!catData) {
        const { data: byNameAr } = await supabase
          .from('categories')
          .select('*')
          .eq('name_ar', decodedSlug)
          .maybeSingle();
        catData = byNameAr;
      }

      // 4. Special fallback mapping for standard english slugs to database arabic slugs/names
      if (!catData) {
        let fallbackNames: string[] = [];
        if (decodedSlug === 'sports' || decodedSlug === 'sport') {
          fallbackNames = ['الرياضه', 'الرياضة', 'رياضة'];
        } else if (decodedSlug === 'politics') {
          fallbackNames = ['سياسه', 'سياسة', 'سياسيه', 'سياسية'];
        } else if (decodedSlug === 'economy') {
          fallbackNames = ['اقتصاد', 'الاقتصاد'];
        } else if (decodedSlug === 'tech') {
          fallbackNames = ['تكنولوجيا', 'التكنولوجيا', 'تقنية'];
        }

        for (const name of fallbackNames) {
          const { data: byName } = await supabase
            .from('categories')
            .select('*')
            .eq('name_ar', name)
            .maybeSingle();
          if (byName) {
            catData = byName;
            break;
          }
          
          const { data: bySlug } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', name)
            .maybeSingle();
          if (bySlug) {
            catData = bySlug;
            break;
          }
        }
      }

      if (catData) {
        setCategory(catData);

        // Fetch subcategories
        const { data: subCats } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', catData.id);

        const categoryIds = [catData.id];
        if (subCats) {
          categoryIds.push(...subCats.map(c => c.id));
        }

        // Fetch news for this category and its subcategories
        const { data: newsData } = await supabase
          .from('news')
          .select('*, category:categories(name_ar)')
          .in('category_id', categoryIds)
          .eq('status', 'PUBLISHED')
          .order('created_at', { ascending: false });
        
        if (newsData) {
          setNews(newsData);
        } else {
          setNews([]);
        }
      } else {
        setCategory(null);
        setNews([]);
      }

      setLoading(false);
    }
    fetchData();
  }, [slug, supabase]);

  const getPreviewText = (item: any) => {
    if (item.summary) return item.summary;
    
    try {
      const content = item.content;
      if (!content) return '';
      
      if (typeof content === 'string') {
        return content.substring(0, 150) + '...';
      }
      
      const blocks = content.content || content.blocks || (Array.isArray(content) ? content : null);
      
      if (Array.isArray(blocks)) {
        for (const block of blocks) {
          const nestedContent = block.content;
          if (Array.isArray(nestedContent)) {
            const textNode = nestedContent.find((n: any) => n.type === 'text');
            if (textNode && textNode.text) {
              return textNode.text.substring(0, 150) + '...';
            }
          }
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!category && news.length === 0) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center space-y-6">
          <h2 className="text-4xl font-black text-slate-900">القسم غير موجود</h2>
          <p className="text-slate-500 font-bold">عذراً، لم نتمكن من العثور على الأخبار في هذا القسم حالياً.</p>
          <Link href="/">
            <Button className="rounded-2xl font-black h-14 px-10 mt-8">العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#142038] text-white" dir="rtl">
      <Navbar />
      <BreakingNewsTicker />

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 border-b-4 border-white/10 pb-12">
          <div className="bg-[#1c2e4e] border border-white/5 text-white px-10 py-4 rounded-[1.5rem] shadow-2xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              {category?.name_ar || slug}
            </h1>
          </div>
          <div className="flex-1 text-start">
             <p className="text-white/70 font-black text-xl md:text-2xl italic">أحدث الأخبار والتحليلات في قسم {category?.name_ar || slug}</p>
             <div className="flex items-center gap-3 mt-4">
                <div className="w-12 h-1 bg-primary rounded-full" />
                <span className="text-white/40 font-bold uppercase tracking-widest text-xs">{news.length} خبر منشور</span>
             </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {news.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={item.id}
              className="group cursor-pointer space-y-6"
            >
              <Link href={`/news/${item.slug || item.id}`}>
                <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 bg-[#1c2e4e]">
                  <Image 
                    src={item.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'} 
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-6 right-6">
                    <span className="bg-[#142038]/90 backdrop-blur-md text-white px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl border border-white/10">
                      {item.category?.name_ar}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="space-y-4 text-start px-2">
                <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString('en-GB')}</span>
                  <span className="w-1 h-1 bg-white/10 rounded-full" />
                  <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> هيئة التحرير</span>
                </div>
                <Link href={`/news/${item.slug || item.id}`}>
                  <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors leading-tight">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-white/60 font-bold line-clamp-2 leading-relaxed">
                  {getPreviewText(item)}
                </p>
                <Link href={`/news/${item.slug || item.id}`} className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                  إقرأ المزيد
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {news.length === 0 && (
          <div className="py-32 text-center bg-[#1c2e4e] rounded-[4rem] border-2 border-dashed border-white/5">
             <p className="text-white/40 font-black text-2xl italic">لا توجد أخبار في هذا القسم حالياً</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

function Button({ children, className, ...props }: any) {
  return (
    <button className={`bg-slate-950 text-white hover:bg-primary transition-all ${className}`} {...props}>
      {children}
    </button>
  );
}
