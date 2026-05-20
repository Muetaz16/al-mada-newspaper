'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Trash2,
  Loader2,
  BarChart3,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  MoreVertical,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function PollsPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Form State
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  
  const supabase = createClient();

  useEffect(() => {
    fetchPolls();
    
    // Auto-refresh every 15 seconds to see live votes
    const interval = setInterval(() => {
      fetchPolls(true); // silent fetch
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  async function fetchPolls(silent = false) {
    if (!silent) setLoading(true);
    const { data } = await supabase
      .from('polls')
      .select('*, options:poll_options(*)')
      .order('created_at', { ascending: false });
    if (data) setPolls(data);
    setLoading(false);
  }

  const addOption = () => setOptions([...options, '']);
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const createPoll = async () => {
    if (!question || options.some(opt => !opt)) {
      alert('يرجى إكمال السؤال وجميع الخيارات');
      return;
    }
    
    setSaving(true);
    const pollId = generateUUID();
    const now = new Date().toISOString();

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({ 
        id: pollId,
        question,
        status: 'ACTIVE',
        created_at: now
      });

    if (pollError) {
      alert('خطأ في إنشاء الاستبيان: ' + pollError.message);
      setSaving(false);
      return;
    }

    const pollOptions = options.map(opt => ({ 
      id: generateUUID(),
      poll_id: pollId, 
      text: opt,
      votes_count: 0
    }));

    await supabase.from('poll_options').insert(pollOptions);

    setOpen(false);
    setSaving(false);
    setQuestion('');
    setOptions(['', '']);
    fetchPolls();
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    await supabase.from('polls').update({ status: newStatus }).eq('id', id);
    fetchPolls();
  };

  const deletePoll = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الاستبيان؟')) return;
    await supabase.from('polls').delete().eq('id', id);
    fetchPolls();
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="text-start">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-primary font-black text-xs uppercase tracking-widest">تفاعل الجمهور</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">إدارة الاستبيانات</h2>
          <p className="text-slate-500 text-sm font-bold mt-2">راقب آراء جمهورك وحلل النتائج في الوقت الفعلي</p>
        </div>
        <Button onClick={() => setOpen(true)} className="font-black h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-all">
          <Plus className="ml-2 h-6 w-6" />
          إنشاء استبيان جديد
        </Button>
      </div>

      {loading ? (
        <div className="py-32 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary opacity-20" />
          <p className="mt-4 font-bold text-slate-400">جاري جلب البيانات...</p>
        </div>
      ) : polls.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 shadow-none rounded-[3rem] bg-slate-50/50 py-32 text-center">
          <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <BarChart3 className="h-10 w-10 text-slate-200" />
          </div>
          <p className="text-slate-400 font-black text-xl">لا توجد استبيانات نشطة حالياً</p>
          <Button variant="link" onClick={() => setOpen(true)} className="mt-2 font-bold text-primary">ابدأ بإنشاء أول استبيان الآن</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce((acc: number, cur: any) => acc + (cur.votes_count || 0), 0);
            
            return (
              <Card key={poll.id} className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white hover:shadow-primary/5 transition-all duration-500 group">
                <CardHeader className="p-8 pb-6 bg-slate-50/50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 text-start flex-1">
                      <div className="flex items-center gap-3">
                        <Badge className={`
                          font-black text-[10px] px-3 py-1 rounded-full border-none shadow-sm
                          ${poll.status === 'ACTIVE' ? 'bg-green-500 text-white animate-pulse' : 'bg-slate-400 text-white'}
                        `}>
                          {poll.status === 'ACTIVE' ? 'نشط الآن' : 'مكتمل'}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(poll.created_at).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-black text-slate-800 leading-tight">
                        {poll.question}
                      </CardTitle>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white shadow-sm">
                          <MoreVertical className="h-5 w-5 text-slate-400" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[160px]">
                        <DropdownMenuItem 
                          className="rounded-xl py-3 font-bold gap-3"
                          onClick={() => toggleStatus(poll.id, poll.status)}
                        >
                          {poll.status === 'ACTIVE' ? (
                            <>
                              <XCircle className="h-4 w-4 text-amber-500" />
                              إغلاق الاستبيان
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              إعادة تفعيل
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          variant="destructive" 
                          className="rounded-xl py-3 font-bold gap-3"
                          onClick={() => deletePoll(poll.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف نهائي
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase">إجمالي المشاركين</span>
                        <span className="text-sm font-black text-slate-900">{totalVotes.toLocaleString()} صوت</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-8 space-y-6">
                  {poll.options.map((opt: any, index: number) => {
                    const percentage = totalVotes === 0 ? 0 : Math.round(((opt.votes_count || 0) / totalVotes) * 100);
                    const isWinner = totalVotes > 0 && percentage === Math.max(...poll.options.map((o: any) => totalVotes === 0 ? 0 : Math.round(((o.votes_count || 0) / totalVotes) * 100)));

                    return (
                      <div key={opt.id} className="group/opt space-y-3 text-start">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover/opt:bg-primary group-hover/opt:text-white transition-colors">
                              {index + 1}
                            </span>
                            <span className={`font-black text-sm transition-colors ${isWinner ? 'text-primary' : 'text-slate-600'}`}>
                              {opt.text}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-slate-900">{percentage}%</span>
                            <span className="text-[9px] font-bold text-slate-400">{opt.votes_count || 0} صوت</span>
                          </div>
                        </div>
                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-[2px]">
                          <div 
                            className={`
                              h-full rounded-full transition-all duration-1000 ease-out relative
                              ${isWinner ? 'bg-gradient-to-l from-primary to-primary/60' : 'bg-slate-200'}
                            `} 
                            style={{ width: `${percentage}%` }}
                          >
                            {isWinner && (
                              <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[3rem] border-none shadow-2xl sm:max-w-[550px] p-0 overflow-hidden" dir="rtl">
          <div className="bg-primary p-8 text-white relative overflow-hidden">
            <BarChart3 className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
            <DialogHeader className="text-start relative z-10">
              <DialogTitle className="text-3xl font-black">استبيان جديد</DialogTitle>
              <p className="text-white/70 font-bold text-sm mt-1">قم بإعداد سؤالك وخياراتك للبدء في جمع آراء الجمهور</p>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-8 text-start">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">سؤال الاستبيان</label>
              <Input 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="ما هو رأيك في التشكيلة الجديدة؟" 
                className="h-16 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-black text-lg px-6"
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">خيارات التصويت</label>
              <div className="space-y-3">
                {options.map((opt, index) => (
                  <div key={index} className="flex gap-3 group">
                    <div className="flex-1 relative">
                      <Input 
                        value={opt}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`الخيار رقم ${index + 1}`} 
                        className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold px-6"
                      />
                    </div>
                    {options.length > 2 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-14 w-14 rounded-2xl text-red-500 hover:bg-red-50 hover:scale-105 transition-all"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                onClick={addOption}
                className="w-full rounded-2xl border-2 border-dashed border-slate-200 h-14 font-black hover:bg-slate-50 hover:border-primary/30 hover:text-primary transition-all text-slate-400"
              >
                <Plus className="ml-2 h-5 w-5" />
                إضافة خيار إضافي
              </Button>
            </div>
          </div>
          <DialogFooter className="p-8 bg-slate-50 gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-2xl font-bold h-14 px-8 text-slate-500 hover:bg-slate-200">إلغاء</Button>
            <Button onClick={createPoll} disabled={saving} className="rounded-2xl font-black h-14 px-10 shadow-xl shadow-primary/20 bg-primary flex-1">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'نشر الاستبيان الآن'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
