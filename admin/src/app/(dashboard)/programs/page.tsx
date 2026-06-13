'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Tv, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Image as ImageIcon,
  UploadCloud,
  FileVideo,
  Globe
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ProgramsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setCoverFile(selectedFile);
    setMessage(null);

    // Generate cover art preview URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setCoverPreview(objectUrl);
  };

  const getYoutubeThumbnail = (urlStr: string) => {
    if (!urlStr) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlStr.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setMessage({ type: 'error', text: 'الرجاء إدخال عنوان البرنامج' });
      return;
    }
    if (!videoUrl) {
      setMessage({ type: 'error', text: 'الرجاء إدخال رابط يوتيوب أو الرابط الخارجي للبرنامج' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      let finalCoverUrl = '';

      // 1. Upload Cover Image (Optional)
      if (coverFile) {
        const coverFormData = new FormData();
        coverFormData.append('file', coverFile);
        coverFormData.append('folder', 'programs');

        const coverRes = await fetch('/api/upload', {
          method: 'POST',
          body: coverFormData,
        });

        if (coverRes.ok) {
          const coverData = await coverRes.json();
          finalCoverUrl = coverData.url;
        }
      } else if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        // Auto extract YouTube thumbnail
        const ytThumb = getYoutubeThumbnail(videoUrl);
        if (ytThumb) {
          finalCoverUrl = ytThumb;
        }
      }

      // 2. Save Record to Database
      const payload = {
        title,
        video_url: videoUrl,
        thumbnail: finalCoverUrl || null,
      };

      const { error } = await supabase.from('programs').insert([payload]);

      if (error) {
        throw new Error(error.message || 'فشل حفظ بيانات البرنامج في قاعدة البيانات');
      }

      // Success Reset
      setMessage({ type: 'success', text: 'تم نشر حلقة البرنامج بنجاح!' });
      setTitle('');
      setVideoUrl('');
      setCoverFile(null);
      setCoverPreview(null);
      
      if (coverInputRef.current) coverInputRef.current.value = '';
      
      fetchItems();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء الحفظ' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف حلقة البرنامج هذه نهائياً؟')) return;

    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);

      if (error) {
        alert('حدث خطأ أثناء الحذف: ' + error.message);
      } else {
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <Tv className="w-5 h-5 text-primary" />
            </div>
            <span className="text-primary font-black text-xs uppercase tracking-widest text-start">الوسائط المتقدمة</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">إدارة البرامج (Programs)</h2>
          <p className="text-slate-400 font-bold text-sm">أضف روابط البرامج المباشرة والمسجلة من يوتيوب لتظهر بأسلوب تفاعلي رائع على الصفحة الرئيسية.</p>
        </div>
      </div>

      {/* Interactive Uploader form */}
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-slate-950 text-white relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

        <CardContent className="p-8 md:p-12 space-y-8 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <UploadCloud className="text-primary w-6 h-6 animate-pulse" />
            <h3 className="text-xl font-black text-white">نشر حلقة برنامج جديدة</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-6 text-start">
            
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-300">عنوان البرنامج / الحلقة</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="اكتب عنوان البرنامج هنا..."
                required
                className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold px-6 text-base placeholder:text-white/20 focus:ring-2 focus:ring-primary/20 w-full hover:bg-white/10 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-300">رابط الفيديو (YouTube URL)</label>
              <Input 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                dir="ltr"
                className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold px-6 text-base placeholder:text-white/20 focus:ring-2 focus:ring-primary/20 w-full hover:bg-white/10 transition-colors"
              />
            </div>

            {/* Cover Image Upload Box */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-300 block">صورة غلاف البرنامج (اختياري - يتم جلبها تلقائياً من يوتيوب إن لم ترفع صورة)</label>
              <div className="relative group h-48 bg-white/5 border-2 border-dashed border-white/10 hover:border-primary/40 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center hover:bg-white/10 transition-all cursor-pointer overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*"
                  ref={coverInputRef}
                  onChange={handleCoverChange}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                />
                {coverPreview ? (
                  <>
                    <img src={coverPreview} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" alt="Preview" />
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <span className="bg-primary px-4 py-2 rounded-xl text-xs font-black shadow-lg">تغيير الصورة</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-slate-200">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-105 transition-all">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-200">اختر صورة الغلاف</span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-1">صورة بنسبة 16:9 هي الأفضل</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button 
                type="submit"
                disabled={uploading}
                className="h-14 px-12 rounded-2xl bg-primary hover:scale-[1.02] active:scale-98 transition-all font-black text-base shadow-xl shadow-primary/20 gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <Tv className="w-5 h-5" />
                    نشر وتوليد البرنامج
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List existing Programs */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-4 border-b border-slate-100 pb-4 text-start">
          <Globe className="w-5 h-5 text-slate-400" />
          <h3 className="font-black text-slate-600">قائمة البرامج المنشورة</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 flex items-center justify-between group hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all text-start"
            >
              <div className="flex items-center gap-6 flex-1 min-w-0">
                {/* Cover Art Image */}
                <div className="h-20 w-32 rounded-[1.5rem] overflow-hidden bg-slate-950 border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center relative">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary/30 flex items-center justify-center">
                      <Tv className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-10">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <h4 className="font-black text-slate-800 text-lg leading-tight truncate group-hover:text-primary transition-colors">{item.title}</h4>
                  <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="font-mono bg-slate-100 px-3 py-1 rounded-lg">{new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
                    {item.video_url && (
                      <span className="truncate max-w-[300px] font-mono text-slate-300 bg-slate-50 px-3 py-1 rounded-lg select-all">{item.video_url}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(item.id)}
                className="h-12 w-12 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}

          {items.length === 0 && !loading && (
            <div className="py-24 text-center bg-slate-50 rounded-[3.5rem] border-2 border-dashed border-slate-200">
              <Tv className="h-20 w-20 text-slate-200 mx-auto mb-4 animate-bounce" />
              <p className="text-slate-400 font-black text-xl italic">لا توجد برامج منشورة حالياً</p>
            </div>
          )}

          {loading && (
            <div className="py-20 text-center text-slate-400">
              <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-2" />
              <span className="text-xs font-black">جاري تحميل البرامج...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
