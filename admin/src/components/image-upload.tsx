'use client';

import { useState, useRef } from 'react';
import { ImageIcon, Loader2, X, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'news');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'فشل رفع الصورة');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error: any) {
      alert('خطأ في الرفع: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className="group relative aspect-video bg-slate-50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {value ? (
        <>
          <img src={value} alt="Cover" className="w-full h-full object-contain bg-black/5" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={removeImage}
              className="rounded-xl font-bold"
            >
              <X className="ml-2 h-4 w-4" />
              إزالة الصورة
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4 text-slate-400 group-hover:text-primary transition-colors">
          <div className="bg-white p-4 rounded-2xl group-hover:bg-primary/10 transition-all">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
          </div>
          <span className="text-sm font-black">{uploading ? 'جاري الرفع...' : 'صورة الغلاف'}</span>
          <span className="text-[10px] font-bold text-slate-400">انقر أو اسحب لرفع صورة</span>
        </div>
      )}
    </div>
  );
}
