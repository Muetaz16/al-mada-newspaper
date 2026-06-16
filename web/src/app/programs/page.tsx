'use client';

import { useState, useEffect, Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import Image from 'next/image';
import { Footer } from '@/components/footer';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { 
  Play, 
  Tv, 
  Calendar, 
  Sparkles,
  LayoutGrid,
  TrendingUp,
  Loader2
} from 'lucide-react';

const isYoutube = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  let id = '';
  if (url.includes('shorts/')) {
    id = url.split('shorts/')[1]?.split(/[?&]/)[0];
  } else {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    id = (match && match[2].length === 11) ? match[2] : '';
  }
  return id ? `https://www.youtube.com/embed/${id}` : url;
};

function ProgramsContent() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramIdx, setSelectedProgramIdx] = useState(0);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const programId = searchParams.get('id');

  useEffect(() => {
    async function fetchPrograms() {
      const { data } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setPrograms(data);
      setLoading(false);
    }
    fetchPrograms();
  }, [supabase]);

  useEffect(() => {
    if (programs.length > 0 && programId) {
      const idx = programs.findIndex((p: any) => p.id === programId);
      if (idx !== -1) {
        setSelectedProgramIdx(idx);
      }
    }
  }, [programs, programId]);

  const featuredProgram = programs.length > 0 ? programs[selectedProgramIdx] : null;

  const getSameGroupEpisodes = () => {
    if (!featuredProgram) return [];
    const groupId = featuredProgram.parent_id || featuredProgram.id;
    return programs
      .filter((p: any) => p.parent_id === groupId || p.id === groupId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const selectEpisodeById = (id: string) => {
    const idx = programs.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      setSelectedProgramIdx(idx);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-400 font-black tracking-widest uppercase text-xs">جاري تحميل البرامج...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary/20" dir="rtl">
      <Navbar />
      
      {/* Editorial Light Accent Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 py-20 space-y-24 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-slate-200/60 pb-16 text-start">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10 shadow-sm">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <span className="text-primary font-black text-sm uppercase tracking-[0.4em]">بث مرئي</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-slate-950">برامج المدى</h1>
            <p className="text-slate-600 font-bold text-xl max-w-3xl italic leading-relaxed">
              باقة متنوعة من البرامج الحوارية والسياسية والاجتماعية بأبعاد تحليلية ومحتوى مرئي متميز.
            </p>
          </div>
          
          {/* Elegant Premium Glass Stat Pill */}
          <div className="flex items-center gap-6 bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-100/50">
            <div className="text-start">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي البرامج</span>
              <span className="text-3xl font-black tracking-tighter text-slate-900">{programs.length} برنامج</span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="bg-primary/10 p-3 rounded-2xl">
              <LayoutGrid className="w-6 h-6 text-primary" />
            </div>
          </div>
        </header>

        {/* Featured Program Video Player */}
        {featuredProgram && (
          <section className="space-y-12">
            <div className="flex items-center gap-3 text-start">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">العرض الرئيسي الحالي</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-8 group bg-slate-950/40 rounded-[2.5rem] border border-slate-200 p-6 md:p-8 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 flex flex-col gap-6 backdrop-blur-md">
                {/* Responsive Video Embed Card */}
                <div className="relative block aspect-[16/10] rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 bg-slate-900">
                  {isYoutube(featuredProgram.video_url) ? (
                    <iframe
                      src={getEmbedUrl(featuredProgram.video_url)}
                      className="absolute inset-0 w-full h-full object-contain bg-[#0c1220] z-20 border-none"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={featuredProgram.video_url}
                      className="absolute inset-0 w-full h-full object-contain bg-[#0c1220] z-20 border-none"
                      controls
                    />
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4 text-start">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                    <span className="text-slate-500 font-extrabold">{new Date(featuredProgram.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-primary font-black uppercase text-[10px] tracking-widest">برنامج مرئي</span>
                  </div>

                  <h3 className="text-3xl md:text-4.5xl font-black leading-tight tracking-tighter text-slate-950">
                    {featuredProgram.title}
                  </h3>
                </div>
              </div>

              {/* Sidebar playlist info */}
              <div className="lg:col-span-4 space-y-6 text-start">
                <div className="bg-white/80 border border-slate-200/60 rounded-[2.5rem] p-6 space-y-6 shadow-xl shadow-slate-100/50">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <Tv className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-black text-slate-950">حلقات البرنامج</h3>
                    </div>
                    <span className="text-[10px] bg-primary/10 text-primary font-black px-2.5 py-1 rounded-md">
                      {getSameGroupEpisodes().length} حلقات
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                    {getSameGroupEpisodes().map((episode: any) => {
                      const isCurrent = episode.id === featuredProgram.id;
                      return (
                        <div
                          key={episode.id}
                          onClick={() => selectEpisodeById(episode.id)}
                          className={`flex gap-4 p-3 rounded-2xl border transition-all cursor-pointer items-center ${
                            isCurrent
                              ? 'bg-primary/5 border-primary/20 shadow-sm'
                              : 'bg-transparent border-transparent hover:bg-slate-50'
                          }`}
                        >
                          <div className="relative w-16 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                            {episode.thumbnail ? (
                              <Image
                                src={episode.thumbnail}
                                alt={episode.title}
                                fill
                                sizes="80px"
                                className="object-contain bg-[#0c1220]"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                <Play className="w-4 h-4 text-slate-400 fill-slate-400" />
                              </div>
                            )}
                            {isCurrent && (
                              <div className="absolute inset-0 bg-primary/25 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className={`text-xs font-black leading-snug line-clamp-2 ${isCurrent ? 'text-primary' : 'text-slate-800'}`}>
                              {episode.title}
                            </h4>
                            <span className="text-[9px] font-bold text-slate-400 block">
                              {new Date(episode.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {getSameGroupEpisodes().length === 0 && (
                      <p className="text-xs text-slate-400 font-bold italic py-4 text-center">لا توجد حلقات أخرى لهذا البرنامج</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Gallery Grid */}
        <section className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/60 pb-8">
            <div className="flex items-center gap-4 text-start">
              <Tv className="w-8 h-8 text-primary" />
              <h3 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">كل الحلقات والبرامج</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {programs.map((item, idx) => (
              <div 
                key={item.id} 
                className={`group space-y-6 text-start cursor-pointer rounded-[2.5rem] p-4 border transition-all duration-300 ${selectedProgramIdx === idx ? 'bg-primary/5 border-primary/20' : 'bg-transparent border-transparent hover:bg-slate-100/50'}`} 
                onClick={() => setSelectedProgramIdx(idx)}
              >
                {/* Clean Premium Grid Card with Zoom Thumbnail */}
                <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-200/40 shadow-md transition-all duration-500 group-hover:translate-y-[-4px] group-hover:shadow-lg">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain bg-[#0c1220] group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                      <Play className="w-8 h-8 text-slate-500 fill-slate-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-slate-950/20 flex items-center justify-center transition-all duration-500">
                    <div className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-all duration-300">
                      <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Card Metadata & Title */}
                <div className="space-y-2 px-2">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {new Date(item.created_at).toLocaleDateString('en-GB')}
                  </div>
                  <h4 className="text-lg md:text-xl font-black leading-tight text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>

          {programs.length === 0 && (
            <div className="py-44 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm">
              <Tv className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-black text-slate-400 italic">لا توجد برامج مضافة حالياً...</h3>
            </div>
          )}
        </section>

      </div>
      <Footer />
    </main>
  );
}

export default function ProgramsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-400 font-black tracking-widest uppercase text-xs">جاري تحميل الصفحة...</p>
      </div>
    }>
      <ProgramsContent />
    </Suspense>
  );
}
