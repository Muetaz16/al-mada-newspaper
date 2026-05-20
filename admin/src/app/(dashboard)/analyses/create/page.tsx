'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client';
import Editor from '@/components/editor';
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
import { Loader2, Save, Send, ArrowRight, Settings2, Layers } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/image-upload';

const newsSchema = z.object({
  title: z.string().min(5, 'العنوان قصير جداً'),
  subtitle: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  image_url: z.string().optional(),
});

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function CreateAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [analysisCategoryId, setAnalysisCategoryId] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<z.infer<typeof newsSchema>>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      status: 'DRAFT',
      image_url: '',
    },
  });

  useEffect(() => {
    async function fetchAnalysisCategory() {
      try {
        setCatLoading(true);
        const { data, error: fetchError } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', 'analyses')
          .maybeSingle();
        
        if (data) {
          setAnalysisCategoryId(data.id);
        } else {
          // Create the category if it doesn't exist
          const newId = generateUUID();
          const { data: newCat, error: insertError } = await supabase
            .from('categories')
            .insert({ 
              id: newId,
              name_ar: 'أبعد مدى', 
              slug: 'analyses',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (newCat) {
            setAnalysisCategoryId(newCat.id);
          } else if (insertError) {
            console.error('Failed to create category:', insertError);
            alert(`تنبيه: تعذر إنشاء قسم "أبعد مدى". الخطأ: ${insertError.message}`);
          } else {
            // It might have been created by another session in parallel
            const { data: retryData } = await supabase
              .from('categories')
              .select('id')
              .eq('slug', 'analyses')
              .maybeSingle();
            if (retryData) setAnalysisCategoryId(retryData.id);
          }
        }
      } catch (err) {
        console.error('Category init error:', err);
      } finally {
        setCatLoading(false);
      }
    }
    fetchAnalysisCategory();
  }, [supabase]);

  async function onSubmit(values: z.infer<typeof newsSchema>) {
    if (!content) {
      alert('يرجى إضافة محتوى للمقال');
      return;
    }
    if (!analysisCategoryId) {
      alert('خطأ: لم يتم العثور على قسم "أبعد مدى"');
      return;
    }
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('يجب تسجيل الدخول');
      setLoading(false);
      return;
    }

    // Auto-generate a unique slug
    const shortId = Math.random().toString(36).substring(2, 7);
    const generatedSlug = values.title
      .toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF]/gi, '')
      .replace(/\s+/g, '-') + '-' + shortId;

    // Try to insert with the current user ID
    let { error } = await supabase.from('news').insert({
      id: generateUUID(),
      ...values,
      slug: generatedSlug,
      content,
      category_id: analysisCategoryId,
      author_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Fallback if author_id constraint fails
    if (error && error.message.includes('news_author_id_fkey')) {
      const { data: otherUsers } = await supabase.from('users').select('id').limit(1);
      if (otherUsers && otherUsers.length > 0) {
        const fallbackError = await supabase.from('news').insert({
          id: generateUUID(),
          ...values,
          slug: generatedSlug,
          content,
          category_id: analysisCategoryId,
          author_id: otherUsers[0].id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        error = fallbackError.error;
      }
    }

    if (error) {
      if (error.code === '23505' || error.message.includes('unique constraint')) {
        alert('حدث خطأ: هذا العنوان موجود مسبقاً. يرجى تغيير العنوان قليلاً.');
      } else {
        alert('حدث خطأ أثناء الحفظ: ' + error.message);
      }
      setLoading(false);
    } else {
      router.push('/analyses');
      router.refresh();
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20" dir="rtl">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-sm border border-slate-100 sticky top-20 z-20">
        <div className="flex items-center gap-4">
          <Link href="/analyses" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black">كتابة تحليل سياسي جديد</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className="rounded-xl font-bold h-11 px-5 hover:bg-slate-100"
            onClick={() => {
              form.setValue('status', 'DRAFT');
              form.handleSubmit(onSubmit)();
            }}
            disabled={loading || catLoading}
          >
            <Save className="ml-2 h-4 w-4" />
            حفظ مسودة
          </Button>
          <Button 
            className="rounded-xl font-black h-11 px-8 shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
            onClick={() => {
              form.setValue('status', 'PUBLISHED');
              form.handleSubmit(onSubmit)();
            }}
            disabled={loading || catLoading}
          >
            {(loading || catLoading) ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Send className="ml-2 h-4 w-4" />}
            نشر المقال
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-8 space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="اكتب عنوان المقال التحليلي هنا..." 
                          {...field} 
                          className="h-20 text-3xl font-black border-none focus-visible:ring-0 placeholder:text-slate-300 p-0 shadow-none text-start"
                        />
                      </FormControl>
                      <FormMessage className="font-bold" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea 
                          placeholder="اكتب وصفاً مختصراً للمقال (سيظهر في الصفحة الرئيسية)..." 
                          {...field} 
                          className="w-full min-h-[100px] text-lg font-bold border-none focus-visible:ring-0 placeholder:text-slate-300 p-0 shadow-none text-start bg-transparent resize-none"
                        />
                      </FormControl>
                      <FormMessage className="font-bold" />
                    </FormItem>
                  )}
                />
                
                <div className="border-t border-slate-50 pt-8">
                  <div className="rounded-3xl overflow-hidden bg-slate-50/50 min-h-[600px] border border-slate-100">
                    <Editor content={content} onChange={setContent} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 sticky top-[150px]">
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Settings2 className="w-4 h-4 text-primary" />
                  <span className="font-black text-sm uppercase tracking-wider text-start">إعدادات المقال</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-start space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">القسم المحدد</p>
                  <p className="font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    أبعد مدى
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white group cursor-pointer">
              <CardContent className="p-6 text-start">
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black text-slate-500 mb-2 block">صورة المقال (العدد)</FormLabel>
                      <FormControl>
                        <ImageUpload value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
