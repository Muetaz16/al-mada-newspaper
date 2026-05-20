'use client';
 
import { useState, useEffect, useRef } from 'react';
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

export function PodcastSection() {
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

  useEffect(() => {
    async function fetchPodcasts() {
      const { data } = await supabase
        .from('audio_recordings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        setPodcasts(data);
        setActiveTrack(data[0]); // Default to latest track
      }
      setLoading(false);
    }
    fetchPodcasts();
  }, [supabase]);

  // Playback Control Handlers
  const handlePlayPause = () => {
    if (!audioRef.current || !activeTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error("Audio playback error:", err));
      setIsPlaying(true);
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
      setDuration(0);
      // Let standard HTML5 source update before auto-playing
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error("Audio playback error:", err));
        }
      }, 100);
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
    if (audioRef.current && duration > 0) {
      const clickRatio = index / totalBars;
      const targetTime = clickRatio * duration;
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
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
      {activeTrack && (
        <audio
          ref={audioRef}
          src={activeTrack.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
      )}

      {/* Header Section */}
      <div className="flex items-center gap-6 border-b border-slate-100 pb-6 text-start">
        <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter bg-slate-900 text-white px-6 py-2 flex items-center gap-3">
          <Mic className="w-8 h-8 text-primary animate-pulse" />
          البودكاست (البث الصوتي)
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Cinematic Audio Theater (Left Card) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-[3.5rem] p-8 md:p-12 border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6)]">
          
          {/* Subtle Ambient Red Glow */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 opacity-80" />
            <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-red-500/5 rounded-full blur-[90px] -ml-32 -mb-32 opacity-40" />
          </div>

          <div className="relative z-10 space-y-8">
            
            {/* Top controls row */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-primary' : 'bg-slate-500'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-primary' : 'bg-slate-500'}`}></span>
                </span>
                <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">
                  {isPlaying ? 'يتم التشغيل الآن 🎧' : 'البث جاهز للاستماع'}
                </span>
              </div>
            </div>

            {/* Featured Track Info (Album Disc Grid) */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center text-start">
              
              {/* GORGEOUS SQUARE COVER IMAGE (Not Rotating) */}
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/10 shrink-0 group shadow-2xl flex items-center justify-center">
                <img 
                  src={activeTrack?.cover_url || defaultCover} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt={activeTrack?.title || "Podcast cover"} 
                />
                
                {/* Elegant overlay gradient to make it blend into the background */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-85" />
                
                {/* High-end mic indicator if playing */}
                {isPlaying && (
                  <div className="absolute top-4 right-4 bg-primary text-white p-2.5 rounded-2xl shadow-lg animate-bounce z-10">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Episode Metadata */}
              <div className="space-y-4 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs font-bold">
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    المدة: {formatTime(duration || activeTrack?.duration || 0)}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {new Date(activeTrack?.created_at || featuredTrack.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
                
                <h4 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                  {activeTrack?.title || featuredTrack.title}
                </h4>
              </div>

            </div>

          </div>

          {/* ACTIVE INTERACTIVE WAVEFORM */}
          <div className="relative z-10 pt-10 border-t border-white/5 space-y-6">
            
            {/* Visualizer bars */}
            <div className="flex items-end gap-0.5 sm:gap-1.5 h-20 w-full px-1 overflow-hidden" dir="ltr">
              {activePeaks.map((peak: number, idx: number) => {
                const totalBars = activePeaks.length;
                const currentRatio = currentTime / (duration || 1);
                const barRatio = idx / totalBars;
                const isPlayed = barRatio <= currentRatio;

                return (
                  <div
                    key={idx}
                    onClick={() => handleWaveformClick(idx, totalBars)}
                    className={`w-full rounded-full cursor-pointer transition-all duration-300 hover:scale-y-110
                      ${isPlayed 
                        ? 'bg-primary hover:bg-primary shadow-[0_0_12px_rgba(255,61,61,0.5)]' 
                        : 'bg-white/10 hover:bg-white/30'}`}
                    style={{ 
                      height: `${peak}%`,
                    }}
                  />
                );
              })}
            </div>

            {/* Player Controls Panel */}
            <div className="flex items-center justify-between gap-6">
              
              {/* Play / Status block */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={handlePlayPause}
                  className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 hover:shadow-primary/20 transition-all shrink-0 group"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 text-white fill-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                  )}
                </button>

                <div className="text-start font-mono">
                  <span className="text-xl font-black text-white">{formatTime(currentTime)}</span>
                  <span className="text-sm text-white/30 px-1.5">/</span>
                  <span className="text-xs text-white/40">{formatTime(duration || activeTrack?.duration || 0)}</span>
                </div>
              </div>

              {/* Mute and audio controls */}
              <button 
                onClick={toggleMute}
                className="h-12 w-12 bg-white/5 border border-white/10 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl flex items-center justify-center transition-all"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
              </button>

            </div>

          </div>

        </div>

        {/* Previous Tracks Feed (Right Sidebar) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6 h-full">
          <div className="bg-slate-50 border border-slate-200/60 rounded-[3.5rem] p-8 flex flex-col gap-6 flex-1 min-w-0 shadow-sm">
            
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4 text-start">
              <Mic className="w-5 h-5 text-slate-500" />
              <h4 className="font-black text-slate-700 text-lg">الأرشيف الصوتي</h4>
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
                        ? 'bg-primary/5 border-primary/20 shadow-md ring-1 ring-primary/5' 
                        : 'bg-white border-slate-100 hover:border-primary/20 shadow-sm hover:scale-[1.01]'}`}
                  >
                    {/* Small cover image preview */}
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center relative">
                      {track.cover_url ? (
                        <img src={track.cover_url} className="w-full h-full object-cover" alt="" />
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
                        ${isActive ? 'text-primary' : 'text-slate-800 group-hover:text-primary'}`}>
                        {track.title}
                      </h5>
                      <div className="flex items-center gap-2.5 text-[9px] font-bold text-slate-400">
                        <span>{new Date(track.created_at).toLocaleDateString('en-GB')}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
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
