'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Radio, Loader2, Save, Tv, AlertCircle } from 'lucide-react';

export default function LiveStreamAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stream, setStream] = useState<any>(null);
  
  // Form fields state
  const [title, setTitle] = useState('البث المباشر لقناة المدى');
  const [streamUrl, setStreamUrl] = useState('');
  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchLiveStreamSettings() {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const currentStream = data[0];
        setStream(currentStream);
        setTitle(currentStream.title || 'البث المباشر لقناة المدى');
        setStreamUrl(currentStream.stream_url || '');
        setStatus(currentStream.status === 'ONLINE' ? 'ONLINE' : 'OFFLINE');
      }
      setLoading(false);
    }
    fetchLiveStreamSettings();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      title,
      stream_url: streamUrl,
      status,
      viewer_count: status === 'ONLINE' ? Math.floor(Math.random() * 20) + 5 : 0
    };

    if (stream?.id) {
      // Update existing record
      const { error } = await supabase
        .from('live_streams')
        .update(payload)
        .eq('id', stream.id);

      if (error) {
        setMessage({ type: 'error', text: 'فشل حفظ التحديثات: ' + error.message });
      } else {
        setMessage({ type: 'success', text: 'تم حفظ إعدادات البث المباشر بنجاح!' });
        setStream({ ...stream, ...payload });
      }
    } else {
      // Create new record without .select() to comply with db-proxy limits
      const { error } = await supabase
        .from('live_streams')
        .insert([payload]);

      if (error) {
        setMessage({ type: 'error', text: 'فشل إنشاء البث المباشر: ' + error.message });
      } else {
        setMessage({ type: 'success', text: 'تم إنشاء إعدادات البث المباشر بنجاح!' });
        
        // Re-query settings to fetch the generated record
        const { data: refetched } = await supabase
          .from('live_streams')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (refetched && refetched.length > 0) {
          setStream(refetched[0]);
        }
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-bold text-sm">جاري تحميل إعدادات البث...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto" dir="rtl">
      
      {/* Page Title */}
      <div className="text-start space-y-2">
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Tv className="w-8 h-8 text-primary animate-pulse" />
          إدارة البث المباشر
        </h2>
        <p className="text-muted-foreground text-sm font-bold">
          قم بإدارة حالة البث المباشر وتحديث روابط القنوات والتحكم بالظهور الفوري في الموقع الإلكتروني.
        </p>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-10 space-y-8">
          
          {/* Status Indicator Panel */}
          <div className={`p-6 rounded-[2rem] flex items-center justify-between border ${status === 'ONLINE' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
            <div className="flex items-center gap-4 text-start">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status === 'ONLINE' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">الحالة الحالية</span>
                <span className={`text-lg font-black ${status === 'ONLINE' ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {status === 'ONLINE' ? 'البث المباشر نـشـط الآن 📡' : 'البث المباشر مـغـلـق 💤'}
                </span>
              </div>
            </div>
            
            {/* Quick Toggle Tab Group */}
            <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 flex gap-2">
              <button
                type="button"
                onClick={() => setStatus('OFFLINE')}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${status === 'OFFLINE' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                مغلق
              </button>
              <button
                type="button"
                onClick={() => setStatus('ONLINE')}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${status === 'ONLINE' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                بث مباشر نشط
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="space-y-6 text-start">
            
            {/* Input fields */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700">عنوان البث المباشر</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: البث المباشر لقناة المدى - تغطية شاملة"
                required
                className="h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 font-bold"
              />
              <span className="text-[10px] font-bold text-slate-400 block mt-1">يظهر هذا العنوان كعنوان رئيسي لصفحة البث المباشر للمشاهدين.</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700">رابط البث (YouTube Link أو HLS Stream URL)</label>
              <Input
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID أو رابط بث HLS (.m3u8)"
                required
                className="h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 font-mono text-xs text-start"
              />
              <span className="text-[10px] font-bold text-slate-400 block mt-1">
                يدعم كلاً من روابط البث المباشر من يوتيوب (العادي أو Live)، أو روابط البث التلفزيوني المباشر (HLS / m3u8) مباشرة.
              </span>
            </div>

            {/* Notification Messages */}
            {message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            {/* Save Buttons */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="h-12 px-8 rounded-xl font-black gap-2 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ الإعدادات والتحديث فوراً
                  </>
                )}
              </Button>
            </div>

          </form>

        </CardContent>
      </Card>
      
    </div>
  );
}
