'use client';

import { X, Play, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
  views?: number;
}

export function VideoModal({ isOpen, onClose, videoUrl, title, views }: VideoModalProps) {
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Handle YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let id = '';
      if (url.includes('shorts/')) {
        id = url.split('shorts/')[1]?.split(/[?&]/)[0];
      } else {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        id = (match && match[2].length === 11) ? match[2] : '';
      }
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
    }
    return url;
  };

  const isYoutube = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-none shadow-2xl rounded-[2.5rem]">
        <div className="relative aspect-video w-full bg-black">
          {isOpen && (
            <>
              {isYoutube(videoUrl) ? (
                <iframe
                  src={getEmbedUrl(videoUrl)}
                  className="w-full h-full border-none"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <video
                  src={videoUrl}
                  className="w-full h-full"
                  controls
                  autoPlay
                />
              )}
            </>
          )}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all z-50 backdrop-blur-md border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {title && (
          <div className="p-10 bg-slate-950 text-white text-start">
            <h4 className="text-3xl font-black tracking-tight">{title}</h4>
            <div className="mt-6 flex items-center gap-6 text-slate-400 text-sm font-bold">
               {views !== undefined && (
                 <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {views.toLocaleString()} مشاهدة
                 </span>
               )}
               <span className="w-1.5 h-1.5 rounded-full bg-primary" />
               <span className="uppercase tracking-widest text-[10px]">المدى TV</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
