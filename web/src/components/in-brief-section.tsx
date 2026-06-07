import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Flame, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { VideoModal } from './video-modal';

export function InBriefSection() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('reels')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setReels(data);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (reels.length === 0) return null;

  return (
    <section className="space-y-12">
      <div className="flex items-center gap-6 border-b border-white/10 pb-6">
        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter bg-[#1c2e4e] border border-white/5 px-6 py-2 rounded-2xl shadow-xl">
          بإيجاز
        </h3>
        <p className="text-white/60 font-bold text-lg hidden md:block">فيديو قصير يفسر الخبر في الحاضر أو التاريخ</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {reels.map((reel) => (
          <motion.div
            key={reel.id}
            whileHover={{ y: -15, scale: 1.02 }}
            className="group relative aspect-[9/16] rounded-[3.5rem] overflow-hidden bg-slate-950 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] border border-white/10 ring-1 ring-white/5"
          >
            <div className="absolute inset-0 pointer-events-none">
              <img
                src={reel.thumbnail || 'https://images.unsplash.com/photo-1485846234645-a62644f84728'}
                alt={reel.title}
                className="w-full h-full object-cover opacity-60 transition-transform duration-[4000ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>
            
            <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-20">
              <div className="bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-2xl flex items-center gap-2 border border-white/20 pointer-events-none">
                <Flame className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-[10px] font-black text-white tracking-widest">{(reel.views || 0).toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setSelectedVideo(reel)}
                className="h-12 w-12 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_-5px_rgba(255,61,61,0.5)] hover:scale-110 hover:shadow-[0_0_50px_-5px_rgba(255,61,61,0.8)] transition-all duration-500 cursor-pointer group/play"
              >
                <Play className="w-5 h-5 text-white fill-white ml-0.5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <div className="absolute bottom-10 left-8 right-8 text-start z-20">
              <div className="space-y-3">
                <div className="h-1 w-12 bg-primary rounded-full" />
                <h4 
                  onClick={() => setSelectedVideo(reel)}
                  className="text-xl font-black text-white leading-tight drop-shadow-2xl line-clamp-3 cursor-pointer hover:text-primary transition-all duration-300 tracking-tighter"
                >
                  {reel.title}
                </h4>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoUrl={selectedVideo?.video_url}
        title={selectedVideo?.title}
        views={selectedVideo?.views}
      />
    </section>
  );
}
