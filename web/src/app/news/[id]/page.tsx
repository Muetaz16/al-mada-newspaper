import { Navbar } from '@/components/navbar';
import { User, Calendar, Clock, TrendingUp, Vote, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/footer';

function parseContent(raw: any, subtitle: string | null): string {
  const fallback = subtitle
    ? `<p class="text-slate-600 text-xl leading-loose">${subtitle}</p>`
    : '<p class="text-slate-400">لا يوجد محتوى لهذا الخبر.</p>';

  if (!raw) return fallback;

  // raw could be a JSON object (from Prisma Json field) or a string
  let doc: any = raw;

  // If it's a string, try to parse it
  if (typeof raw === 'string') {
    if (raw.trim() === '') return fallback;
    try {
      doc = JSON.parse(raw);
    } catch {
      // Plain text or HTML string
      if (raw.trim().startsWith('<')) return raw;
      return raw.split('\n').map((p: string) => p.trim() ? `<p>${p}</p>` : '<br/>').join('') || fallback;
    }
  }

  // Handle TipTap / ProseMirror JSON doc
  if (doc?.type === 'doc' && Array.isArray(doc?.content)) {
    const html = doc.content.map((node: any) => {
      if (node.type === 'paragraph') {
        const text = (node.content || []).map((n: any) => n.text || '').join('');
        return text ? `<p>${text}</p>` : '<br/>';
      }
      if (node.type === 'heading') {
        const text = (node.content || []).map((n: any) => n.text || '').join('');
        const level = node.attrs?.level || 2;
        return `<h${level}>${text}</h${level}>`;
      }
      if (node.type === 'bulletList') {
        const items = (node.content || []).map((li: any) => {
          const text = (li.content?.[0]?.content || []).map((n: any) => n.text || '').join('');
          return `<li>${text}</li>`;
        }).join('');
        return `<ul>${items}</ul>`;
      }
      if (node.type === 'orderedList') {
        const items = (node.content || []).map((li: any) => {
          const text = (li.content?.[0]?.content || []).map((n: any) => n.text || '').join('');
          return `<li>${text}</li>`;
        }).join('');
        return `<ol>${items}</ol>`;
      }
      return '';
    }).join('');
    return html.trim() || fallback;
  }

  return fallback;
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch by UUID or slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  let news: any = null;

  if (isUUID) {
    const { data } = await supabase
      .from('news')
      .select('*, category:categories(name_ar, slug)')
      .eq('id', id)
      .maybeSingle();
    news = data;
  }

  if (!news) {
    const { data } = await supabase
      .from('news')
      .select('*, category:categories(name_ar, slug)')
      .eq('slug', decodeURIComponent(id))
      .maybeSingle();
    news = data;
  }

  if (!news) {
    notFound();
  }

  // Fetch related news for sidebar (excluding current)
  const { data: trending } = await supabase
    .from('news')
    .select('*, category:categories(name_ar)')
    .eq('status', 'PUBLISHED')
    .neq('id', news.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch active poll
  const { data: poll } = await supabase
    .from('polls')
    .select('*, options:poll_options(*)')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const contentHtml = parseContent(news.content, news.subtitle || null);

  return (
    <main className="min-h-screen bg-slate-50/30" dir="rtl">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* ─── Main Article ─── */}
          <article className="lg:col-span-8 space-y-10">

            {/* Breadcrumbs */}
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-start">
              <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/category/${news.category?.slug}`} className="text-primary">
                {news.category?.name_ar}
              </Link>
            </div>

            {/* Header */}
            <header className="space-y-6 text-start">
              <h1 className="text-4xl md:text-6xl font-black leading-tight text-slate-900 tracking-tight">
                {news.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 py-6 border-y border-slate-100 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-slate-900">إدارة التحرير</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{new Date(news.created_at).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>5 دقائق قراءة</span>
                </div>
              </div>
            </header>

            {/* Hero Image */}
            <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200">
              <Image
                src={news.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995'}
                alt={news.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1200px"
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Article Body */}
            <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl shadow-slate-100/50">
              <div
                className="prose prose-xl prose-slate max-w-none text-start font-medium leading-[2.2] text-slate-700 prose-headings:font-black prose-p:mb-8"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </div>

          </article>

          {/* ─── Sidebar ─── */}
          <aside className="lg:col-span-4 space-y-12">

            {/* Trending News */}
            <div className="space-y-8 text-start">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4 className="text-xl font-black text-slate-900 tracking-tight">أخبار رائجة</h4>
              </div>
              <div className="space-y-6">
                {trending?.map((item: any) => (
                  <Link key={item.id} href={`/news/${item.slug || item.id}`} className="flex gap-4 group">
                    <div className="relative h-20 w-24 shrink-0 rounded-2xl overflow-hidden shadow-sm">
                      <Image
                        src={item.image_url || 'https://images.unsplash.com/photo-1512433035046-39973f1fca12'}
                        alt={item.title}
                        fill
                        sizes="120px"
                        className="object-cover group-hover:scale-110 transition-all duration-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-primary uppercase">
                        {item.category?.name_ar}
                      </span>
                      <h5 className="text-sm font-black text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h5>
                    </div>
                  </Link>
                ))}
                {(!trending || trending.length === 0) && (
                  <p className="text-slate-400 font-bold text-sm">لا توجد أخبار أخرى حالياً.</p>
                )}
              </div>
            </div>

            {/* Poll Widget */}
            {poll && (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl">
                <div className="flex items-center gap-2">
                  <Vote className="w-5 h-5 text-primary" />
                  <span className="text-white font-black text-[10px] uppercase tracking-widest">شاركنا رأيك</span>
                </div>
                <h4 className="text-lg font-black text-start">{poll.question}</h4>
                <div className="space-y-3">
                  {poll.options?.map((opt: any) => (
                    <button
                      key={opt.id}
                      className="w-full text-start p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all font-bold text-xs"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
                <button className="w-full h-12 bg-primary rounded-xl font-black text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                  تصويت
                </button>
              </div>
            )}

          </aside>

        </div>
      </div>
      <Footer />
    </main>
  );
}
