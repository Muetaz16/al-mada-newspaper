'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Zap, 
  Settings2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function BreakingNewsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [text, setText] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase
      .from('breaking_news')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  async function handleAdd() {
    if (!text) return;
    setSaving(true);
    const { error } = await supabase.from('breaking_news').insert({
      text,
      active: true
    });
    if (error) alert('خطأ: ' + error.message);
    else {
      setText('');
      fetchItems();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف هذا الخبر السريع؟')) return;
    await supabase.from('breaking_news').delete().eq('id', id);
    fetchItems();
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center border border-red-200">
              <Zap className="w-5 h-5 text-red-600 animate-pulse" />
            </div>
            <span className="text-red-600 font-black text-xs uppercase tracking-widest">شريط الأخبار</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">الأخبار السريعة (Fast News)</h2>
          <p className="text-slate-400 font-bold text-sm">أضف الأخبار التي تظهر في شريط العاجل بالموقع</p>
        </div>
      </div>

      {/* Add New */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-900 text-white">
        <CardContent className="p-8 md:p-12 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Plus className="text-primary w-6 h-6" />
            <h3 className="text-xl font-black">إضافة خبر عاجل جديد</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Input 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب الخبر العاجل هنا..."
              className="h-16 rounded-2xl bg-white/10 border-none text-white font-bold px-6 text-lg placeholder:text-white/20 focus:ring-2 focus:ring-primary/20 flex-1"
            />
            <Button 
              onClick={handleAdd}
              disabled={saving}
              className="h-16 px-10 rounded-2xl bg-primary hover:scale-[1.02] transition-all font-black text-lg shadow-xl shadow-primary/20"
            >
              {saving ? <Loader2 className="animate-spin h-6 w-6" /> : 'إضافة ونشر'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-4 border-b border-slate-100 pb-4">
          <Settings2 className="w-5 h-5 text-slate-400" />
          <h3 className="font-black text-slate-600">الأخبار المنشورة حالياً</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              key={item.id}
              className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50 flex items-center justify-between group hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-6 text-start">
                <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-slate-800 text-lg leading-tight">{item.text}</p>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>{new Date(item.created_at).toLocaleTimeString('ar-EG')}</span>
                    <Badge className="bg-green-50 text-green-600 border-none px-3 py-0.5 rounded-lg">نشط الآن</Badge>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(item.id)}
                className="h-12 w-12 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </motion.div>
          ))}

          {items.length === 0 && !loading && (
            <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <Zap className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-black text-xl italic">لا توجد عواجل منشورة حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple mock for motion to avoid warnings
const motion = { 
  div: ({ children, className, layout, initial, animate, exit, transition, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ) 
};
