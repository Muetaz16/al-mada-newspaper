'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Music2, User, ChevronUp, ChevronDown, Loader2, Video as VideoIcon, Volume2, VolumeX } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { createClient } from '@/utils/supabase/client';

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const supabase = createClient();

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
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}` : url;
  };

  useEffect(() => {
    async function fetchReels() {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('type', 'REEL')
        .order('created_at', { ascending: false });
      
      if (data) setReels(data);
      setLoading(false);
    }
    fetchReels();
  }, [supabase]);

  // Ensure video plays when index changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => console.log("Auto-play blocked or error:", err));
    }
  }, [currentIdx]);

  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentIdx < reels.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else if (e.deltaY < 0 && currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-white/20 font-black text-sm tracking-widest uppercase">جاري تحميل الريلز...</p>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white space-y-6">
        <Navbar />
        <div className="bg-white/5 p-16 rounded-[4rem] border border-white/10 text-center space-y-6">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <VideoIcon className="w-12 h-12 text-white/20" />
          </div>
          <p className="text-2xl font-black opacity-30 italic">لا توجد ريلز متاحة حالياً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 overflow-hidden flex flex-col" dir="rtl">
      <div className="z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <Navbar />
      </div>

      <div 
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onWheel={handleScroll}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={reels[currentIdx].id}
            initial={{ y: 500, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -500, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="relative w-full max-w-[450px] aspect-[9/16] bg-black md:rounded-[3.5rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.8)] border border-white/5 group"
          >
            {isYoutube(reels[currentIdx].url) ? (
              <iframe
                src={getEmbedUrl(reels[currentIdx].url)}
                className="w-full h-full object-cover border-none"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                loop
                muted={muted}
                playsInline
                className="w-full h-full object-cover"
                onClick={() => setMuted(!muted)}
              >
                <source src={encodeURI(reels[currentIdx].url)} type="video/mp4" />
                <source src={encodeURI(reels[currentIdx].url)} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            )}

            {/* Mute Indicator Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <AnimatePresence>
                {muted && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="bg-black/40 backdrop-blur-md p-6 rounded-full"
                  >
                    <VolumeX className="w-10 h-10 text-white opacity-50" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* UI Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end text-white text-start pointer-events-none">
              <div className="space-y-6 relative z-10 pointer-events-auto">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 border border-white/10">
                    <User className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-base tracking-tight">@InjazNews</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-[10px] text-primary font-black uppercase tracking-widest">محرر المدى</span>
                    </div>
                  </div>
                  <button className="mr-auto bg-white/10 hover:bg-white/20 backdrop-blur-xl px-6 py-2 rounded-2xl text-[10px] font-black transition-all border border-white/10 uppercase tracking-widest">
                    متابعة
                  </button>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-black leading-tight drop-shadow-xl">{reels[currentIdx].title}</h4>
                  <p className="text-sm font-medium opacity-60 line-clamp-2 leading-relaxed">
                    اكتشف تفاصيل حصرية عبر ريلز المدى الرقمية. تجربة إخبارية بنكهة مختلفة.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black opacity-50 bg-white/5 py-3 px-4 rounded-2xl w-fit border border-white/5">
                  <Music2 className="h-4 w-4 text-primary" />
                  <span>الصوت الأصلي - المدى نيوز</span>
                </div>
              </div>
            </div>

            {/* Side Actions */}
            <div className="absolute left-8 bottom-32 flex flex-col items-center gap-10 text-white z-20">
              <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <div className="h-16 w-16 rounded-[2rem] bg-white/10 backdrop-blur-2xl flex items-center justify-center group-hover:bg-red-500 transition-all duration-500 border border-white/10 shadow-2xl">
                  <Heart className="h-8 w-8" />
                </div>
                <span className="text-[10px] font-black tracking-widest opacity-60">12.4K</span>
              </div>
              <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <div className="h-16 w-16 rounded-[2rem] bg-white/10 backdrop-blur-2xl flex items-center justify-center group-hover:bg-primary transition-all duration-500 border border-white/10 shadow-2xl">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <span className="text-[10px] font-black tracking-widest opacity-60">450</span>
              </div>
              <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <div className="h-16 w-16 rounded-[2rem] bg-white/10 backdrop-blur-2xl flex items-center justify-center group-hover:bg-primary transition-all duration-500 border border-white/10 shadow-2xl">
                  <Share2 className="h-8 w-8" />
                </div>
                <span className="text-[10px] font-black tracking-widest opacity-60 uppercase">مشاركة</span>
              </div>
              <div 
                className="h-16 w-16 rounded-[2rem] bg-white/10 backdrop-blur-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
                onClick={() => setMuted(!muted)}
              >
                {muted ? <VolumeX className="h-7 w-7" /> : <Volume2 className="h-7 w-7" />}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute right-12 flex flex-col gap-10 text-white/10 hidden xl:flex">
          <button 
            onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
            disabled={currentIdx === 0}
            className="hover:text-primary transition-all disabled:opacity-5 hover:scale-125"
          >
            <ChevronUp className="h-16 w-16" />
          </button>
          <div className="h-32 w-px bg-white/5 mx-auto" />
          <button 
            onClick={() => currentIdx < reels.length - 1 && setCurrentIdx(currentIdx + 1)}
            disabled={currentIdx === reels.length - 1}
            className="hover:text-primary transition-all disabled:opacity-5 hover:scale-125"
          >
            <ChevronDown className="h-16 w-16" />
          </button>
        </div>
      </div>
    </div>
  );
}
