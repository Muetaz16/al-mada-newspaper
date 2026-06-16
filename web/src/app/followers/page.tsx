'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Video as VideoIcon,
  Calendar,
  ArrowLeft,
  Sparkles,
  LayoutGrid,
  TrendingUp,
  X,
  Loader2
} from 'lucide-react';

export default function FollowersPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [activeMediaFilter, setActiveMediaFilter] = useState<'ALL' | 'FOLLOWER'>('ALL');
  const supabase = createClient();

  useEffect(() => {
    async function fetchVideos() {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setVideos(data);
      setLoading(false);
    }
    fetchVideos();
  }, [supabase]);

  const filteredVideos = videos.filter((v: any) => v.type === 'FOLLOWER');

  const featuredVideo = filteredVideos.length > 0 ? filteredVideos[0] : null;
  const remainingVideos = filteredVideos.slice(1);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-400 font-black tracking-widest uppercase text-xs">جاري تحميل المكتبة...</p>
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
              <span className="text-primary font-black text-sm uppercase tracking-[0.4em]"> المدى</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-slate-950">متابعات</h1>
            <p className="text-slate-600 font-bold text-xl max-w-3xl italic leading-relaxed">
              تغطيات حصرية، ومتابعة مستمرة لأهم الأحداث.
            </p>
          </div>

          {/* Elegant Premium Glass Stat Pill */}
          <div className="flex items-center gap-6 bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-100/50">
            <div className="text-start">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي التغطيات</span>
              <span className="text-3xl font-black tracking-tighter text-slate-900">{filteredVideos.length} متابعة مرئية</span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="bg-primary/10 p-3 rounded-2xl">
              <LayoutGrid className="w-6 h-6 text-primary" />
            </div>
          </div>
        </header>

        {/* Featured Content Area */}
        {featuredVideo && (
          <section className="space-y-12 cursor-pointer" onClick={() => setActiveVideo(featuredVideo)}>
            <div className="flex items-center gap-3 text-start">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">أحدث تغطية مميزة</h2>
            </div>

            <div className="relative aspect-video max-h-[520px] w-full rounded-[3rem] md:rounded-[4rem] overflow-hidden group shadow-2xl border border-slate-200/50">
              <Image
                src={featuredVideo.thumbnail_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728'}
                alt={featuredVideo.title}
                fill
                priority
                className="object-contain bg-[#0c1220] group-hover:scale-105 transition-all duration-[3000ms]"
              />

              {/* Custom Gradient to ensure white title stands out beautifully */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-28 w-28 md:h-36 md:w-36 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-all duration-700">
                  <div className="h-20 w-20 md:h-26 md:w-26 bg-primary rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="h-8 w-8 md:h-12 md:w-12 fill-white text-white ml-2" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 md:bottom-16 right-10 md:right-16 left-10 md:left-16 space-y-4 text-start z-10">
                <span className="inline-block bg-primary text-white font-black px-4 py-1.5 rounded-xl text-[9px] uppercase tracking-wider shadow-lg">
                  عرض الآن
                </span>
                <h3 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight max-w-4xl tracking-tighter text-white drop-shadow-lg">
                  {featuredVideo.title}
                </h3>
              </div>
            </div>
          </section>
        )}

        {/* Gallery Grid */}
        <section className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/60 pb-8">
            <div className="flex items-center gap-4 text-start">
              <VideoIcon className="w-8 h-8 text-primary" />
              <h3 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">أرشيف المتابعات</h3>
            </div>

            <button
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 bg-primary text-white shadow-lg shadow-primary/20`}
            >
              المتابعات ({filteredVideos.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {remainingVideos.map((video) => (
              <div key={video.id} className="group space-y-6 text-start cursor-pointer" onClick={() => setActiveVideo(video)}>
                {/* Clean Premium Grid Card with Zoom Thumbnail */}
                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200/40 shadow-xl transition-all duration-500 group-hover:translate-y-[-8px] group-hover:shadow-2xl">
                  <Image
                    src={video.thumbnail_url || 'https://images.unsplash.com/photo-1492724441997-5dc865305da7'}
                    alt={video.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain bg-[#0c1220] group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 flex items-center justify-center transition-all duration-500 backdrop-blur-[2px] group-hover:backdrop-blur-[4px]">
                    <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-all duration-300">
                      <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Metadata & Title */}
                <div className="space-y-3 px-4">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {new Date(video.created_at).toLocaleDateString('en-GB')}
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-wide">
                      متابعة
                    </span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-black leading-tight text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                    {video.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>

          {remainingVideos.length === 0 && !featuredVideo && (
            <div className="py-44 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm">
              <VideoIcon className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-black text-slate-400 italic">المكتبة خالية حالياً في هذا القسم...</h3>
            </div>
          )}
        </section>

      </div>
      <Footer />

      {/* Cinematic Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setActiveVideo(null)}
          >
            <button className="absolute top-10 left-10 text-white/30 hover:text-white transition-all hover:scale-110">
              <X className="w-12 h-12" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className={
                activeVideo.type === 'REEL'
                  ? "relative w-full max-w-[400px] aspect-[9/16] h-[85vh] rounded-[3rem] overflow-hidden bg-black shadow-[0_0_120px_rgba(255,255,255,0.05)] border border-white/10"
                  : "relative w-full max-w-6xl aspect-video rounded-[3rem] md:rounded-[5rem] overflow-hidden bg-slate-900 shadow-[0_0_150px_rgba(var(--primary),0.2)] border border-white/10"
              }
              onClick={(e) => e.stopPropagation()}
            >
              <video
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                <source src={encodeURI(activeVideo.url)} type="video/mp4" />
                <source src={encodeURI(activeVideo.url)} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
