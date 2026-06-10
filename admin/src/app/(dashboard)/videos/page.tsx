'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Trash2,
  Loader2,
  Video,
  Film,
  Play,
  ExternalLink,
  Settings2,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from '@/components/image-upload';
import { VideoUpload } from '@/components/video-upload';

export default function VideosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [type, setType] = useState('VIDEO');
  const [sourceType, setSourceType] = useState<'UPLOAD' | 'URL'>('UPLOAD');
  
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  const handleCreate = () => {
    setEditingItem(null);
    setTitle('');
    setUrl('');
    setThumbnail('');
    setType('VIDEO');
    setSourceType('UPLOAD');
    setOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setUrl(item.url || '');
    setThumbnail(item.thumbnail_url || '');
    setType(item.type || 'VIDEO');
    const isExternal = item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be') || (item.url.startsWith('http') && !item.url.includes('/uploads/')));
    setSourceType(isExternal ? 'URL' : 'UPLOAD');
    setOpen(true);
  };

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

  const saveItem = async () => {
    if (!title || !url) {
      alert('يرجى تعبئة العنوان والرابط');
      return;
    }
    setSaving(true);
    
    let finalThumbnail = thumbnail;
    if (!finalThumbnail && (url.includes('youtube.com') || url.includes('youtu.be'))) {
      const ytThumb = getYoutubeThumbnail(url);
      if (ytThumb) finalThumbnail = ytThumb;
    }

    const payload = {
      title,
      url,
      thumbnail_url: finalThumbnail,
      type,
      status: 'PUBLISHED'
    };

    let error;
    if (editingItem) {
      const { error: updateError } = await supabase.from('videos').update(payload).eq('id', editingItem.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('videos').insert({
        id: generateUUID(),
        ...payload,
        created_at: new Date().toISOString()
      });
      error = insertError;
    }

    if (error) {
      alert('خطأ في الحفظ: ' + error.message);
      setSaving(false);
    } else {
      setOpen(false);
      setSaving(false);
      fetchItems();
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) alert('خطأ في الحذف: ' + error.message);
    fetchItems();
  };

  const renderGrid = (filterType: string) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.filter(i => i.type === filterType).map((item) => (
        <Card key={item.id} className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-primary/10 transition-all duration-500">
          <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
            {item.thumbnail_url ? (
              <img 
                src={item.thumbnail_url} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                {filterType === 'VIDEO' ? <Video className="w-12 h-12" /> : <Film className="w-12 h-12" />}
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
              <a href={item.url} target="_blank" rel="noreferrer" className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <Button className="h-16 w-16 rounded-full bg-primary shadow-2xl hover:scale-110 transition-all border-4 border-white/20">
                  <Play className="h-6 w-6 fill-white text-white ml-1" />
                </Button>
              </a>
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-10 w-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-xl translate-x-4 group-hover:translate-x-0"
                onClick={() => handleEdit(item)}
              >
                <Settings2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-10 w-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-xl translate-x-4 group-hover:translate-x-0"
                onClick={() => deleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="absolute bottom-4 left-4">
              <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 font-black text-[9px] px-3 py-1 rounded-lg">
                {filterType === 'VIDEO' ? 'VIDEO' : 'REEL'}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-8 text-start space-y-4">
            <h3 className="font-black text-xl text-slate-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(item.created_at).toLocaleDateString('en-GB')}
              </div>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 text-[10px] font-black text-primary hover:underline"
              >
                مشاهدة الرابط
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
      {items.filter(i => i.type === filterType).length === 0 && (
        <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            {filterType === 'VIDEO' ? <Video className="h-10 w-10 text-slate-200" /> : <Film className="h-10 w-10 text-slate-200" />}
          </div>
          <p className="text-slate-400 font-black text-xl italic">لا يوجد محتوى في هذا القسم حالياً</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-10 px-4" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="text-start">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-primary font-black text-xs uppercase tracking-widest">مركز الوسائط</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">إدارة الفيديو والريلز</h2>
          <p className="text-slate-500 text-sm font-bold mt-2">نظم مكتبتك المرئية وشاركها مع جمهورك باحترافية</p>
        </div>
        <Button onClick={handleCreate} className="font-black h-16 px-10 rounded-[2rem] shadow-2xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-all text-lg">
          <Plus className="ml-2 h-6 w-6" />
          إضافة محتوى جديد
        </Button>
      </div>

      <Tabs defaultValue="VIDEO" className="w-full">
        <div className="flex justify-center mb-10">
          <TabsList className="bg-slate-100 p-1.5 rounded-[2rem] h-16 w-full max-w-md border border-slate-200 shadow-sm">
            <TabsTrigger value="VIDEO" className="rounded-2xl font-black flex-1 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all">
              <Video className="h-5 w-5" />
              الفيديوهات
            </TabsTrigger>
            <TabsTrigger value="REEL" className="rounded-2xl font-black flex-1 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all">
              <Film className="h-5 w-5" />
              الريلز (Reels)
            </TabsTrigger>
          </TabsList>
        </div>

        {loading ? (
          <div className="py-32 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary opacity-20" />
            <p className="mt-4 font-bold text-slate-400">جاري تحميل المكتبة...</p>
          </div>
        ) : (
          <>
            <TabsContent value="VIDEO">{renderGrid('VIDEO')}</TabsContent>
            <TabsContent value="REEL">{renderGrid('REEL')}</TabsContent>
          </>
        )}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[3rem] border-none shadow-2xl sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] flex flex-col" dir="rtl">
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden shrink-0">
            <Video className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
            <DialogHeader className="text-start relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="text-primary font-black text-[10px] uppercase tracking-[0.2em]">إضافة وسائط</span>
              </div>
              <DialogTitle className="text-3xl font-black">
                {editingItem ? 'تعديل محتوى مرئي' : 'إضافة محتوى مرئي'}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6 text-start overflow-y-auto flex-1 scrollbar-thin">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Layers className="w-3 h-3" />
                  نوع المحتوى
                </label>
                <Select value={type} onValueChange={(val) => setType(val || 'VIDEO')}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold px-6 text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="VIDEO" className="font-bold rounded-xl py-3">فيديو طويل</SelectItem>
                    <SelectItem value="REEL" className="font-bold rounded-xl py-3">ريلز (Reel)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">عنوان المحتوى</label>
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان الفيديو..." 
                  className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold px-6"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1">مصدر الفيديو</label>
              <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setSourceType('UPLOAD'); setUrl(''); }}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${sourceType === 'UPLOAD' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  رفع ملف فيديو
                </button>
                <button
                  type="button"
                  onClick={() => { setSourceType('URL'); setUrl(''); }}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${sourceType === 'URL' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  رابط يوتيوب / خارجي
                </button>
              </div>
            </div>

            {sourceType === 'UPLOAD' ? (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">ملف الفيديو</label>
                <VideoUpload value={url} onChange={setUrl} />
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">رابط الفيديو</label>
                <Input 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... أو أي رابط خارجي" 
                  dir="ltr"
                  className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold px-6 text-start"
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">صورة الغلاف (اختياري)</label>
              <ImageUpload value={thumbnail} onChange={setThumbnail} />
            </div>
          </div>

          <DialogFooter className="p-8 bg-slate-50 gap-4 shrink-0 flex-row">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-2xl font-bold h-14 px-8 text-slate-500 hover:bg-slate-200">إلغاء</Button>
            <Button onClick={saveItem} disabled={saving} className="rounded-2xl font-black h-14 px-12 shadow-xl shadow-primary/20 bg-primary flex-1">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'حفظ ونشر المحتوى'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
