'use client';
 
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { 
  Play, 
  Pause, 
  Mic, 
  Volume2, 
  VolumeX, 
  Clock, 
  Radio, 
  Loader2, 
  Share2, 
  Disc,
  Calendar
} from 'lucide-react';

export function PodcastSection({ showAll = false, hideHeader = false }: { showAll?: boolean; hideHeader?: boolean } = {}) {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Audio Playback Engine States
  const [activeTrack, setActiveTrack] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = createClient();

  const isYoutube = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');

  const getEmbedUrl = (url: string, autoplay: boolean) => {
    if (!url) return '';
    let id = '';
    if (url.includes('shorts/')) {
      id = url.split('shorts/')[1]?.split(/[?&]/)[0];
    } else {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      id = (match && match[2].length === 11) ? match[2] : '';
    }
    return id ? `https://www.youtube.com/embed/${id}?enablejsapi=1${autoplay ? '&autoplay=1' : ''}` : url;
  };

  useEffect(() => {
    async function fetchPodcasts() {
      let query = supabase
        .from('audio_recordings')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!showAll) {
        query = query.limit(5);
      }
        
      const { data } = await query;

      if (data && data.length > 0) {
        setPodcasts(data);
        setActiveTrack(data[0]); // Default to latest track
        setDuration(data[0].duration || 180);
      }
      setLoading(false);
    }
    fetchPodcasts();
  }, [supabase]);

  // Simulated playback progress for YouTube tracks
  useEffect(() => {
    let interval: any;
    if (isPlaying && activeTrack && isYoutube(activeTrack.audio_url)) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeTrack, duration]);

  // Playback Control Handlers
  const handlePlayPause = () => {
    if (!activeTrack) return;

    if (isYoutube(activeTrack.audio_url)) {
      setIsPlaying(!isPlaying);
    } else {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(err => console.error("Audio playback error:", err));
        setIsPlaying(true);
      }
    }
  };

  const handleSelectTrack = (track: any) => {
    const isSameTrack = activeTrack?.id === track.id;
    setActiveTrack(track);

    if (isSameTrack) {
      handlePlayPause();
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(track.duration || 180);

      if (isYoutube(track.audio_url)) {
        setTimeout(() => {
          setIsPlaying(true);
        }, 100);
      } else {
        // Let standard HTML5 source update before auto-playing
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play()
              .then(() => setIsPlaying(true))
              .catch(err => console.error("Audio playback error:", err));
          }
        }, 100);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleWaveformClick = (index: number, totalBars: number) => {
    if (duration > 0) {
      const clickRatio = index / totalBars;
      const targetTime = clickRatio * duration;
      if (activeTrack && isYoutube(activeTrack.audio_url)) {
        setCurrentTime(targetTime);
      } else if (audioRef.current) {
        audioRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Safe fallback cover image
  const defaultCover = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc";

  // Safe fallback peaks
  const defaultPeaks = Array.from({ length: 50 }, (_, i) => 
    Math.sin(i * 0.18) * 30 + 55
  );

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 bg-slate-950/20 rounded-[3rem] border border-slate-900">
        <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-3" />
        <span className="text-sm font-black tracking-widest text-slate-500 uppercase">جاري تحميل البودكاست...</span>
      </div>
    );
  }

  if (podcasts.length === 0) {
    return null; // Gracefully hide if empty
  }

  const featuredTrack = podcasts[0];
  const activePeaks = activeTrack?.waveform_data || defaultPeaks;

  return (
    <section className="space-y-12 py-12" dir="rtl">
      
      {/* Underlying Audio Engine */}
      {activeTrack && !isYoutube(activeTrack.audio_url) && (
        <audio
          ref={audioRef}
          src={activeTrack.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
      )}

      {/* Header Section */}
      {!showAll && !hideHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 text-start">
          <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter bg-[#1c2e4e] border border-white/5 px-6 py-2 rounded-2xl shadow-xl flex items-center gap-3">
            <Mic className="w-8 h-8 text-primary animate-pulse" />
            البرودكاست
          </h3>
          <Link 
            href="/podcasts" 
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-primary text-slate-300 hover:text-white border border-white/10 hover:border-primary px-6 py-3 rounded-2xl font-black transition-all shadow-lg text-sm w-full md:w-auto"
          >
            <Disc className="w-4 h-4" />
            الذهاب لمكتبة البرودكاست
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Cinematic Audio Theater (Left Card) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-[3.5rem] p-8 md:p-12 border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6)]">
          
          {/* Subtle Ambient Red Glow */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 opacity-80" />
            <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-red-500/5 rounded-full blur-[90px] -ml-32 -mb-32 opacity-40" />
          </div>

          <div className="relative z-10 w-full h-full flex flex-col justify-between">
            {activeTrack && (
              <div className="flex flex-col gap-6 w-full text-start justify-between h-full">
                {/* Widescreen Video Player */}
                <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
                  {isYoutube(activeTrack.audio_url) ? (
                    <iframe
                      src={getEmbedUrl(activeTrack.audio_url, false)}
                      className="absolute inset-0 w-full h-full border-none"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeTrack.audio_url}
                      className="absolute inset-0 w-full h-full object-contain bg-[#0c1220] z-20 border-none"
                      controls
                    />
                  )}
                </div>

                {/* Metadata & Title */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs font-bold">
                    <span className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {new Date(activeTrack.created_at).toLocaleDateString('en-GB')}
                    </span>
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      برودكست (فيديو)
                    </span>
                  </div>
                  <h4 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                    {activeTrack.title}
                  </h4>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Previous Tracks Feed (Right Sidebar) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6 h-full">
          <div className="bg-[#1c2e4e] border border-white/5 rounded-[3.5rem] p-8 flex flex-col gap-6 flex-1 min-w-0 shadow-2xl">
            
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 text-start">
              <Mic className="w-5 h-5 text-white/40" />
              <h4 className="font-black text-white text-lg">البرودكاست</h4>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[390px] pr-2 custom-scrollbar">
              {podcasts.map((track) => {
                const isActive = activeTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all cursor-pointer text-start group
                      ${isActive 
                        ? 'bg-primary/10 border-primary/25 shadow-md ring-1 ring-primary/10' 
                        : 'bg-[#142038]/50 border-white/5 hover:border-primary/25 hover:bg-[#142038] shadow-sm hover:scale-[1.01]'}`}
                  >
                    {/* Small cover image preview */}
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center relative">
                      {track.cover_url ? (
                        <img src={track.cover_url} className="w-full h-full object-contain bg-[#0c1220]" alt="" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary/30 flex items-center justify-center">
                          <Mic className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300
                        ${isActive && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isActive && isPlaying ? (
                          <Pause className="w-4 h-4 fill-white text-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h5 className={`font-black text-sm truncate leading-tight transition-colors
                        ${isActive ? 'text-primary' : 'text-white/90 group-hover:text-primary'}`}>
                        {track.title}
                      </h5>
                      <div className="flex items-center gap-2.5 text-[9px] font-bold text-white/40">
                        <span>{new Date(track.created_at).toLocaleDateString('en-GB')}</span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {formatTime(track.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
