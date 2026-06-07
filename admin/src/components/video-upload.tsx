'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Video, CheckCircle2 } from 'lucide-react';

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function VideoUpload({ value, onChange }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 50MB for now)
    if (file.size > 50 * 1024 * 1024) {
      alert('حجم الفيديو كبير جداً (الحد الأقصى 50 ميجابايت)');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'videos');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'فشل رفع الفيديو');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error: any) {
      alert('خطأ في الرفع: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative group rounded-[2.5rem] overflow-hidden bg-slate-900 border-4 border-slate-100 shadow-2xl">
          {value.includes('youtube.com') || value.includes('youtu.be') ? (
            <iframe 
              src={`https://www.youtube.com/embed/${value.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || ''}`}
              className="w-full aspect-video object-cover opacity-80"
            />
          ) : (
            <video 
              src={value} 
              className="w-full aspect-video object-cover opacity-60"
              controls={false}
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-primary drop-shadow-2xl" />
            <span className="text-white font-black text-xs uppercase tracking-widest">جاهز للنشر</span>
          </div>
          <button
            onClick={() => onChange('')}
            className="absolute top-4 left-4 bg-red-500 text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative aspect-video rounded-[2.5rem] border-4 border-dashed border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary/20 transition-all cursor-pointer flex flex-col items-center justify-center space-y-6 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative">
            <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
              {uploading ? (
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              ) : (
                <Video className="h-10 w-10 text-slate-300 group-hover:text-primary transition-colors" />
              )}
            </div>
            {!uploading && (
              <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Upload className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="text-center space-y-2 relative">
            <p className="font-black text-slate-700 group-hover:text-primary transition-colors">اضغط لرفع فيديو جديد</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">MP4, WebM up to 50MB</p>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="video/*"
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
