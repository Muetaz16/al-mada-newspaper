'use client';

import { useState, useEffect, use } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Save, ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/image-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const pulseSchema = z.object({
  question: z.string().min(10, 'السؤال قصير جداً'),
  answer: z.string().min(10, 'الإجابة قصيرة جداً'),
  category: z.string().min(1, 'يرجى اختيار قسم'),
  image_url: z.string().optional().nullable(),
});

export default function EditPulsePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<z.infer<typeof pulseSchema>>({
    resolver: zodResolver(pulseSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: 'جمال',
      image_url: '',
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setFetching(true);
        const { data, error } = await supabase
          .from('pulse_of_life')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          alert('خطأ في جلب البيانات: ' + error.message);
          router.push('/pulse-of-life');
          return;
        }

        if (data) {
          form.reset({
            question: data.question,
            answer: data.answer,
            category: data.category || 'جمال',
            image_url: data.image_url || '',
          });
        }
      } catch (err: any) {
        console.error('Error fetching pulse item:', err);
      } finally {
        setFetching(false);
      }
    }

    fetchData();
  }, [id, form, router, supabase]);

  async function onSubmit(values: z.infer<typeof pulseSchema>) {
    setLoading(true);
    const { error } = await supabase
      .from('pulse_of_life')
      .update({
        ...values,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      alert('حدث خطأ أثناء الحفظ: ' + error.message);
      setLoading(false);
    } else {
      router.push('/pulse-of-life');
      router.refresh();
    }
  }

  if (fetching) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-20" dir="rtl">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-sm border border-slate-100 sticky top-20 z-20">
        <div className="flex items-center gap-4">
          <Link href="/pulse-of-life" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
             <Heart className="w-5 h-5 text-primary" />
             <h2 className="text-xl font-black">تعديل سؤال وجواب</h2>
          </div>
        </div>
        <Button 
          className="rounded-xl font-black h-11 px-8 shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      <Form {...form}>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-6 text-start">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-8 space-y-8">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-black text-slate-500">السؤال</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="مثلاً: كيف أحافظ على نضارة البشرة؟" 
                          {...field} 
                          className="h-14 text-lg font-bold bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20"
                        />
                      </FormControl>
                      <FormMessage className="font-bold" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-black text-slate-500">الإجابة</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="اكتب الإجابة بالتفصيل هنا..." 
                          {...field} 
                          className="min-h-[300px] text-lg font-bold bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 p-6 leading-relaxed"
                        />
                      </FormControl>
                      <FormMessage className="font-bold" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="text-start">
                      <FormLabel className="text-xs font-black text-slate-500">التصنيف</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold">
                            <SelectValue placeholder="اختر تصنيفاً" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                           <SelectItem value="جمال" className="font-bold rounded-lg py-3">جمال</SelectItem>
                           <SelectItem value="صحة" className="font-bold rounded-lg py-3">صحة</SelectItem>
                           <SelectItem value="تغذية" className="font-bold rounded-lg py-3">تغذية</SelectItem>
                           <SelectItem value="صحة نفسية" className="font-bold rounded-lg py-3">صحة نفسية</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black text-slate-500 mb-2 block text-start">صورة توضيحية</FormLabel>
                      <FormControl>
                        <ImageUpload value={field.value || ""} onChange={field.onChange} />
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
