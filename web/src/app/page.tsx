'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { BreakingNewsTicker } from '@/components/breaking-news';
import { HeroSection } from '@/components/hero-section';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Play,
  Calendar,
  Video as VideoIcon,
  Vote,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { CategorySection } from '@/components/category-section';
import { PodcastSection } from '@/components/podcast-section';
import { PulseOfLifeSection } from '@/components/pulse-of-life-section';
import { VideoModal } from '@/components/video-modal';
import { Footer } from '@/components/footer';

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

export default function Home() {
  const [newsByCategory, setNewsByCategory] = useState<Record<string, any[]>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [voted, setVoted] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [activeMediaTab, setActiveMediaTab] = useState<'VIDEO' | 'REEL' | 'PODCAST' | 'FOLLOWER'>('PODCAST');

  const [selectedProgramIdx, setSelectedProgramIdx] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch Categories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name_ar');

      if (cats) setCategories(cats);

      // Fetch all published news
      const { data: news } = await supabase
        .from('news')
        .select('*, category:categories(name_ar, slug)')
        .eq('status', 'PUBLISHED')
        .order('created_at', { ascending: false });

      if (news) {
        // Group by category name for sections
        const grouped = news.reduce((acc: any, item: any) => {
          const catName = item.category?.name_ar || 'أخبار عامة';
          if (!acc[catName]) acc[catName] = [];
          acc[catName].push(item);
          return acc;
        }, {});
        setNewsByCategory(grouped);
      }

      // Fetch latest programs
      const { data: programsData } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });
      if (programsData) setPrograms(programsData);

      // Fetch latest Videos & Reels (Al-Mada TV)
      const { data: videoData } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(16);

      // Fetch active Poll
      const { data: pollData } = await supabase
        .from('polls')
        .select('*, options:poll_options(*)')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (videoData) {
        setVideos(videoData);
      }
      if (pollData) setPoll(pollData);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="space-y-4 text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-white/20 font-black text-xs uppercase tracking-widest">المدى نيوز</p>
        </div>
      </div>
    );
  }

  // Filter videos dynamically in-memory based on active tab
  const filteredVideos = videos.filter((v: any) => v.type === activeMediaTab);

  return (
    <main className="min-h-screen bg-[#142038] text-white" dir="rtl">
      <Navbar />
      <BreakingNewsTicker />

      <div className="container mx-auto px-4 pt-6 pb-16 space-y-24">
        <div className="space-y-4">
          <HeroSection />

          {/* Latest News Section */}
          <section className="space-y-4 pt-1 border-t border-white/5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                <h3 className="text-2xl font-black text-white">آخر الأخبار</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
              {Object.values(newsByCategory).flat().slice(0, 5).map((item: any) => (
                <Link key={item.id} href={`/news/${item.slug}`} className="group relative bg-[#101828] rounded-xl overflow-hidden border border-white/5 shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 block">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={item.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-primary text-[#142038] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                        {item.category?.name_ar || 'أخبار'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 bg-[#101828]">
                    <h4 className="text-sm font-black text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Section: "الأولى" (Main Category News) */}
        <CategorySection
          title="الأولى"
          items={Object.values(newsByCategory).flat()}
          subCategories={
            categories.length > 0
              ? categories.filter((c: any) => !c.parent_id).map((c: any) => c.name_ar)
              : ['سياسة', 'اقتصاد', 'رياضة', 'تكنولوجيا', 'ليبيا', 'منوعات']
          }
        />

        {/* Section: Al-Mada TV (Compact Visual Library) */}
        <section className="relative py-24 rounded-[3rem] bg-slate-950 overflow-hidden text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/10 group/library">
          {/* Immersive Cinematic Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -mr-32 -mt-32 opacity-40 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -ml-32 -mb-32 opacity-20" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 space-y-16">
            {/* Header: Compact Title */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-start border-b border-white/10 pb-10">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg group-hover/library:scale-105 transition-transform duration-500">
                    <VideoIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
                      <span className="text-primary font-black text-[9px] uppercase tracking-[0.3em]">Al-Mada TV</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-none text-white">وسائط المدى</h3>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
                <button
                  onClick={() => setActiveMediaTab('PODCAST')}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${activeMediaTab === 'PODCAST' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                >
                  بودكاست
                </button>
                <button
                  onClick={() => setActiveMediaTab('VIDEO')}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${activeMediaTab === 'VIDEO' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                >
                  تقارير
                </button>
                <button
                  onClick={() => setActiveMediaTab('FOLLOWER')}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${activeMediaTab === 'FOLLOWER' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                >
                  تابعات
                </button>
                <button
                  onClick={() => setActiveMediaTab('REEL')}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${activeMediaTab === 'REEL' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                >
                  ريلز
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {activeMediaTab === 'PODCAST' ? (
                <div className="col-span-full">
                  <PodcastSection hideHeader={true} />
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="col-span-full py-28 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <VideoIcon className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/30 font-black text-xl italic">لا توجد وسائط متاحة في هذا القسم حالياً...</p>
                </div>
              ) : (
                <>
                  {/* Featured Video (Scaled Down) */}
                  <div className="lg:col-span-7 group/main relative">
                    {filteredVideos[0] && (
                      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/5 group-hover/main:border-primary/20 transition-all duration-500">
                        <div className="absolute inset-0 pointer-events-none">
                          <Image
                            src={filteredVideos[0].thumbnail_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728'}
                            alt={filteredVideos[0].title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 800px"
                            priority
                            className="object-cover opacity-60 group-hover/main:scale-105 transition-all duration-[4000ms]"
                          />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 pointer-events-none" />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            onClick={() => setActiveVideo(filteredVideos[0])}
                            className="h-20 w-20 bg-primary rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-500 z-30 group/btn"
                          >
                            <Play className="h-8 w-8 fill-white text-white ml-1 transition-transform" />
                          </button>
                        </div>

                        <div className="absolute bottom-10 right-10 left-10 space-y-3 z-20">
                          <div className="flex items-center gap-2">
                            <span className="bg-primary px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">
                              {filteredVideos[0].type === 'REEL' ? 'REEL (ريلز)' : filteredVideos[0].type === 'FOLLOWER' ? 'متابعة' : 'VIDEO'}
                            </span>
                          </div>
                          <h4
                            onClick={() => setActiveVideo(filteredVideos[0])}
                            className="text-xl md:text-2xl font-black leading-tight drop-shadow-xl max-w-2xl cursor-pointer hover:text-primary transition-all duration-300 tracking-tighter"
                          >
                            {filteredVideos[0].title}
                          </h4>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar Feed (Compact) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="flex items-center gap-3 text-white/20 mb-1">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap">مقاطع مختارة</span>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>

                    {filteredVideos.slice(1, 5).map((v, idx) => (
                      <div key={v.id} className="group/sub flex gap-5 items-center cursor-pointer">
                        <div className="relative aspect-video w-36 rounded-2xl overflow-hidden border border-white/5 shadow-xl shrink-0">
                          <div className="absolute inset-0 pointer-events-none">
                            <Image
                              src={v.thumbnail_url || 'https://images.unsplash.com/photo-1492724441997-5dc865305da7'}
                              alt={v.title}
                              fill
                              sizes="150px"
                              className="object-cover opacity-40 group-hover/sub:scale-110 transition-all duration-700"
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/sub:opacity-100 transition-all duration-500 backdrop-blur-sm">
                            <button
                              onClick={() => setActiveVideo(v)}
                              className="h-8 w-8 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-2xl transition-all"
                            >
                              <Play className="h-3 w-3 fill-slate-950 ml-0.5" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-start flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-black text-[8px]">0{idx + 1}</span>
                            <div className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-white/20 font-bold text-[7px] uppercase tracking-widest">
                              {v.type === 'REEL' ? 'REEL (ريلز)' : v.type === 'FOLLOWER' ? 'متابعة' : 'Al-Mada TV'}
                            </span>
                          </div>
                          <h5
                            onClick={() => setActiveVideo(v)}
                            className="text-base font-black leading-snug hover:text-primary transition-all duration-300 line-clamp-2 tracking-tighter"
                          >
                            {v.title}
                          </h5>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <PulseOfLifeSection />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Featured Program Display (7 cols) */}
          <section className="lg:col-span-7 space-y-8 lg:sticky lg:top-32 text-start">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                  برامج
                </h3>
              </div>
            </div>

            {programs.length > 0 ? (
              <div className="group bg-slate-950/40 rounded-[2.5rem] border border-white/10 p-6 md:p-8 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] transition-all duration-700 flex flex-col gap-6 backdrop-blur-md">
                {/* Responsive Video Embed Card */}
                <div className="relative block aspect-[16/10] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-slate-900">
                  {isYoutube(programs[selectedProgramIdx].video_url) ? (
                    <iframe
                      src={getEmbedUrl(programs[selectedProgramIdx].video_url)}
                      className="absolute inset-0 w-full h-full object-cover z-20 border-none"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={programs[selectedProgramIdx].video_url}
                      className="absolute inset-0 w-full h-full object-cover z-20 border-none"
                      controls
                    />
                  )}
                </div>

                {/* Excerpt Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <span className="text-slate-400 font-extrabold">{new Date(programs[selectedProgramIdx].created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <span className="text-primary font-black uppercase text-[10px] tracking-widest">برنامج مرئي</span>
                  </div>

                  <h4 className="text-2xl md:text-3.5xl font-black leading-tight tracking-tighter text-white">
                    {programs[selectedProgramIdx].title}
                  </h4>
                </div>
              </div>
            ) : (
              <div className="relative aspect-[16/10] rounded-[3rem] overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
                <p className="text-slate-500 font-black text-lg">بانتظار إضافة البرامج...</p>
              </div>
            )}
          </section>

          {/* Right Column: Programs Selector (5 cols) */}
          <section className="lg:col-span-5 space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                  البرامج
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-5 max-h-[850px] overflow-y-auto pr-4 custom-scrollbar">
              {programs.length > 0 ? (
                <>
                  {programs.slice(0, 5).map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedProgramIdx(idx)}
                      className={`group rounded-3xl p-6 border transition-all duration-500 cursor-pointer text-start flex gap-5 items-center relative overflow-hidden backdrop-blur-md
                          ${selectedProgramIdx === idx
                          ? 'bg-slate-950/80 border-primary/30 shadow-[0_20px_40px_-15px_rgba(255,61,61,0.15)] ring-1 ring-primary/20 scale-[1.02]'
                          : 'bg-slate-950/40 border-white/10 hover:border-white/20 hover:scale-[1.01]'}`}
                    >
                      {item.thumbnail ? (
                        <div className="relative w-28 md:w-36 aspect-[16/10] rounded-2xl overflow-hidden shadow-md shrink-0 pointer-events-auto ring-1 ring-white/10">
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            sizes="150px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white drop-shadow-lg" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-28 md:w-36 aspect-[16/10] rounded-2xl overflow-hidden shadow-md shrink-0 bg-slate-800 flex items-center justify-center border border-white/10">
                          <Play className="w-6 h-6 text-slate-500 fill-slate-500" />
                        </div>
                      )}

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedProgramIdx === idx ? 'bg-primary animate-pulse' : 'bg-white/20'}`} />
                          <span>{new Date(item.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' })}</span>
                        </div>

                        <h4 className={`text-base md:text-lg font-black transition-colors leading-snug line-clamp-2 tracking-tighter ${selectedProgramIdx === idx ? 'text-primary' : 'text-white group-hover:text-primary'}`}>
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  ))}

                  <Link
                    href="/programs"
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-black text-sm p-5 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 group mt-2"
                  >
                    <span>كل البرامج</span>
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  </Link>
                </>
              ) : (
                <p className="text-slate-400 font-bold italic">لا توجد برامج مضافة حالياً</p>
              )}
            </div>
          </section>
        </div>

        <section className="pt-20 pb-40">
          <div className="max-w-5xl mx-auto">
            <div className="bg-slate-950 rounded-[4rem] p-12 md:p-20 shadow-2xl relative overflow-hidden text-center text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10 space-y-12">
                <div className="space-y-6 text-center">
                  <div className="flex items-center justify-center gap-3 bg-white/5 w-fit mx-auto px-6 py-2 rounded-full border border-white/10">
                    <Vote className="w-5 h-5 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                    <span className="text-white font-black text-xs uppercase tracking-[0.5em]">استطلاع المدى</span>
                  </div>
                  <h3 className="text-4xl md:text-6xl font-black tracking-tighter">شارك رأيك</h3>
                </div>

                {poll ? (
                  <div className="space-y-12 max-w-4xl mx-auto">
                    <h4 className="text-2xl md:text-4xl font-black leading-tight">{poll.question}</h4>

                    <AnimatePresence>
                      {voted && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="flex flex-col md:flex-row items-center justify-center gap-16 bg-slate-900/60 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 shadow-[0_0_60px_-15px_rgba(255,255,255,0.05)]"
                        >
                          {/* SVG Donut Chart */}
                          <div className="relative w-64 h-64">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                              {poll.options.map((opt: any, idx: number) => {
                                const totalVotes = poll.options.reduce((acc: number, o: any) => acc + (o.votes_count || 0), 0);
                                const percentage = totalVotes > 0 ? (opt.votes_count || 0) / totalVotes : 0;

                                // Calculate offset for this segment
                                let offset = 0;
                                for (let i = 0; i < idx; i++) {
                                  offset += (poll.options[i].votes_count || 0) / totalVotes;
                                }

                                const colors = ['#FF3D3D', '#3DFF7E', '#3D7EFF', '#FFD43D', '#FF3DBC'];
                                const color = colors[idx % colors.length];

                                return (
                                  <motion.circle
                                    key={opt.id}
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke={color}
                                    strokeWidth="12"
                                    strokeDasharray={`${percentage * 251.2} 251.2`}
                                    strokeDashoffset={-offset * 251.2}
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: "0 251.2" }}
                                    animate={{ strokeDasharray: `${percentage * 251.2} 251.2` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                  />
                                );
                              })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-5xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
                                {poll.options.reduce((acc: number, o: any) => acc + (o.votes_count || 0), 0)}
                              </span>
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">إجمالي الأصوات</span>
                            </div>
                          </div>

                          {/* Legend */}
                          <div className="flex-1 grid grid-cols-1 gap-4 text-start">
                            {poll.options.map((opt: any, idx: number) => {
                              const totalVotes = poll.options.reduce((acc: number, o: any) => acc + (o.votes_count || 0), 0);
                              const percentage = totalVotes > 0 ? Math.round(((opt.votes_count || 0) / totalVotes) * 100) : 0;
                              const colors = ['#FF3D3D', '#3DFF7E', '#3D7EFF', '#FFD43D', '#FF3DBC'];
                              const color = colors[idx % colors.length];

                              return (
                                <div key={opt.id} className="flex items-center justify-between gap-4 group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                    <span className="font-bold text-sm text-white/80">{opt.text}</span>
                                  </div>
                                  <span className="font-black text-xl text-white">{percentage}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      {poll.options.map((opt: any, idx: number) => {
                        const totalVotes = poll.options.reduce((acc: number, o: any) => acc + (o.votes_count || 0), 0);
                        const percentage = totalVotes > 0 ? Math.round(((opt.votes_count || 0) / totalVotes) * 100) : 0;
                        const colors = ['#FF3D3D', '#3DFF7E', '#3D7EFF', '#FFD43D', '#FF3DBC'];
                        const color = colors[idx % colors.length];

                        return (
                          <button
                            key={opt.id}
                            disabled={voted}
                            onClick={async () => {
                              setVoted(true);
                              const updatedOptions = poll.options.map((o: any) => o.id === opt.id ? { ...o, votes_count: (o.votes_count || 0) + 1 } : o);
                              setPoll({ ...poll, options: updatedOptions });
                              await supabase.from('poll_options').update({ votes_count: (opt.votes_count || 0) + 1 }).eq('id', opt.id);
                            }}
                            className={`w-full group relative p-8 rounded-[2.5rem] border-2 transition-all text-start overflow-hidden h-28 ${voted ? 'bg-slate-900/50 border-white/5 cursor-default' : 'bg-slate-900/40 border-white/10 hover:border-primary/50 hover:bg-slate-800 hover:shadow-[0_0_30px_-5px_rgba(255,61,61,0.2)] active:scale-95'}`}
                          >
                            {voted && (
                              <div
                                className="absolute inset-y-0 right-0 opacity-20 transition-all duration-1000 ease-out"
                                style={{ width: `${percentage}%`, backgroundColor: color }}
                              />
                            )}
                            <div className="relative z-10 flex items-center justify-between h-full w-full">
                              <span className="text-2xl font-black text-white group-hover:text-primary transition-colors">{opt.text}</span>
                              {voted && <span className="text-4xl font-black text-white drop-shadow-md">{percentage}%</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-2xl mx-auto py-10 opacity-70">
                    <Vote className="w-16 h-16 text-white/20 mx-auto" />
                    <h4 className="text-2xl font-black">لا يوجد استطلاع متاح حالياً</h4>
                    <p className="text-white/50 font-bold text-sm">شكراً لتفاعلكم المستمر، سيتم نشر استطلاع جديد قريباً لمشاركتنا آراءكم.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <VideoModal
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        videoUrl={activeVideo?.url || activeVideo}
        title={activeVideo?.title}
        views={activeVideo?.views}
      />

      <Footer />
    </main>
  );
}
