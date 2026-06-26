'use client';

import { useState } from 'react';
import { Copy, Check, MessageCircle } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10">
      <span className="text-sm font-bold text-white/50">مشاركة الخبر:</span>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
        title="نسخ الرابط"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
      <button
        onClick={handleWhatsApp}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-colors"
        title="مشاركة عبر واتساب"
      >
        <MessageCircle className="w-4 h-4" />
      </button>
    </div>
  );
}
