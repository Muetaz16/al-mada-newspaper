'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Save, ArrowRight, Film } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/image-upload';
import { VideoUpload } from '@/components/video-upload';

const reelSchema = z.object({
  title: z.string().min(5, 'العنوان قصير جداً'),
  video_url: z.string().url('يرجى إدخال رابط فيديو صحيح'),
  thumbnail: z.string().optional(),
});

export default function CreateReelPage() {
  const [loading, setLoading] = useState(false);
  const [sourceType, setSourceType] = useState<'UPLOAD' | 'URL'>('URL');
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<z.infer<typeof reelSchema>>({
    resolver: zodResolver(reelSchema),
    defaultValues: {
      title: '',
      video_url: '',
      thumbnail: '',
    },
  });

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const getYoutubeThumbnail = (urlStr: string) => {
    if (!urlStr) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlStr.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  };

  async function onSubmit(values: z.infer<typeof reelSchema>) {
    setLoading(true);
    let finalThumbnail = values.thumbnail;
    if (!finalThumbnail && (values.video_url.includes('youtube.com') || values.video_url.includes('youtu.be'))) {
      const ytThumb = getYoutubeThumbnail(values.video_url);
      if (ytThumb) finalThumbnail = ytThumb;
    }

    const { error } = await supabase
      .from('reels')
      .insert([
        {
          id: generateUUID(),
          title: values.title,
          video_url: values.video_url,
          thumbnail: finalThumbnail || null,
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      alert('حدث خطأ أثناء الإضافة: ' + error.message);
      setLoading(false);
    } else {
      router.push('/reels');
      router.refresh();
    }
  }

  return (
    <div className="max-w-[800px] mx-auto space-y-6 pb-20" dir="rtl">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-sm border border-slate-100 sticky top-20 z-20">
        <div className="flex items-center gap-4">
          <Link href="/reels" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
             <Film className="w-5 h-5 text-primary" />
             <h2 className="text-xl font-black">إضافة ريل جديد</h2>
          </div>
        </div>
        <Button 
          className="rounded-xl font-black h-11 px-8 shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
          حفظ
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-6 text-start">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="p-8 space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-black text-slate-500">عنوان الفيديو</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="مثلاً: ملخص الأحداث في 60 ثانية" 
                        {...field} 
                        className="h-14 text-lg font-bold bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage className="font-bold" />
                  </FormItem>
                )}
              />
              
              <div className="space-y-3">
                <FormLabel className="text-sm font-black text-slate-500">مصدر الفيديو</FormLabel>
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => { setSourceType('UPLOAD'); form.setValue('video_url', ''); }}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${sourceType === 'UPLOAD' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    رفع ملف فيديو
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSourceType('URL'); form.setValue('video_url', ''); }}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${sourceType === 'URL' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    رابط يوتيوب / خارجي
                  </button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-black text-slate-500">
                      {sourceType === 'UPLOAD' ? 'ملف الفيديو' : 'رابط الفيديو (YouTube/MP4)'}
                    </FormLabel>
                    <FormControl>
                      {sourceType === 'UPLOAD' ? (
                        <VideoUpload value={field.value} onChange={field.onChange} />
                      ) : (
                        <Input 
                          placeholder="https://..." 
                          {...field} 
                          dir="ltr"
                          className="h-14 text-lg font-bold bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20"
                        />
                      )}
                    </FormControl>
                    <FormMessage className="font-bold" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-black text-slate-500 mb-2 block">صورة الغلاف (Thumbnail)</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
