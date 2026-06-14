'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { createClient } from '@/utils/supabase/client';
import { Radio, Loader2, Calendar, Tv, Film, Play, AlertCircle, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';

// Helper to extract YouTube Video ID from any standard URL
function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function LiveStreamPage() {
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState<any>(null);
  const [latestVideos, setLatestVideos] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    async function fetchLiveData() {
      // Query current live settings
      const { data: liveData } = await supabase
        .from('live_streams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (liveData && liveData.length > 0) {
        setStream(liveData[0]);
      }

      // Query latest videos/reels as high-end fallback
      const { data: videoData } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'PUBLISHED')
        .order('created_at', { ascending: false })
        .limit(6);

      if (videoData) {
        setLatestVideos(videoData);
      }
      setLoading(false);
    }
    fetchLiveData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-white/20 font-black tracking-widest uppercase text-xs">جاري تحميل البث المباشر...</p>
      </div>
    );
  }

  const isOnline = stream && stream.status === 'ONLINE' && stream.stream_url;

  // Try to parse YouTube Video ID or fallback to standard URL
  let youtubeId = null;
  if (isOnline) {
    youtubeId = getYouTubeId(stream.stream_url);
    if (!youtubeId && stream.stream_url.length === 11) {
      youtubeId = stream.stream_url;
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-primary/30" dir="rtl">
      <Navbar />

      {/* Crimson and Indigo Theater Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[180px]" />
      </div>

      <div className="container mx-auto px-4 py-20 space-y-16 relative z-10">

        {/* Page Header (Theater Edition) */}
        <header className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 shadow-sm">
            <span className="relative flex h-3.5 w-3.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-red-500' : 'bg-slate-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isOnline ? 'bg-red-500' : 'bg-slate-500'}`}></span>
            </span>
            <span className="text-slate-300 font-black text-xs uppercase tracking-widest">
              {isOnline ? 'بث حي ومباشر الآن' : 'البث المباشر متوقف'}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white drop-shadow-2xl">
            {isOnline ? stream.title : 'تلفزيون المدى'}
          </h1>
          <p className="text-white/40 font-bold text-lg">تأخذك إلى أبعد مدى عبر الصورة والكلمة والحدث الحي.</p>
        </header>

        {/* Live Theater Stage */}
        <div className="w-full">
          {isOnline ? (
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Responsive Video Container */}
              <div className="relative aspect-video w-full rounded-[3.5rem] overflow-hidden bg-black shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10 group">
                {youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&rel=0&showinfo=0`}
                    title={stream.title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  >
                    <source src={encodeURI(stream.stream_url)} type="video/mp4" />
                    <source src={encodeURI(stream.stream_url)} type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              {/* Live Info details */}
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-start space-y-2">
                  <span className="text-primary font-black text-xs uppercase tracking-widest block">نقل مباشر</span>
                  <h2 className="text-2xl font-black text-white">{stream.title}</h2>
                </div>
              </div>
            </div>
          ) : (
            /* Offline stage placeholder */
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl px-6 max-w-4xl mx-auto backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
                  <Tv className="w-10 h-10 text-rose-500" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-4">البث المباشر غير نشط حالياً</h2>
                <p className="text-slate-400 font-bold text-lg max-w-xl leading-relaxed mb-8 mx-auto">
                  التغطية التلفزيونية الحية مغلقة حالياً. لا تفوتك متابعة أحدث تقاريرنا التحريرية والريلز المصورة أدناه.
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/videos">
                    <Button className="font-black bg-primary px-8 h-12 rounded-xl text-xs gap-2 shadow-lg shadow-primary/20">
                      <Film className="w-4 h-4" />
                      الوسائط
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Latest Videos Section */}
        {latestVideos.length > 0 && (
          <section className="space-y-10 pt-16 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <Film className="w-6 h-6 text-primary" />
                أحدث التقارير والتغطيات المصورة
              </h3>
              <Link href="/videos" className="text-primary hover:text-white transition-colors text-xs font-black">
                عرض الكل ←
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestVideos.map((video) => (
                <Link href={`/videos`} key={video.id} className="group space-y-4 text-start block">
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-900 border border-white/5 shadow-lg group-hover:scale-[1.02] transition-all duration-300">
                    <Image
                      src={video.thumbnail_url || 'https://images.unsplash.com/photo-1492724441997-5dc865305da7'}
                      alt={video.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                      <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="px-2 space-y-1">
                    <span className="text-primary font-black text-[9px] uppercase tracking-wider block">
                      {video.type === 'REEL' ? 'ريلز' : 'تقرير'}
                    </span>
                    <h4 className="text-sm font-black text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {video.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
      <Footer />
    </main>
  );
}
