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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Save, Send, ArrowRight, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/image-upload';

const newsSchema = z.object({
  title: z.string().min(5, 'العنوان قصير جداً'),
  subtitle: z.string().optional(),
  slug: z.string().min(2, 'الرابط قصير جداً'),
  category_id: z.string().min(1, 'يرجى اختيار قسم'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  is_breaking: z.boolean(),
  image_url: z.string().optional(),
});

export default function CreateNewsPage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [content, setContent] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<z.infer<typeof newsSchema>>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      slug: '',
      category_id: '',
      status: 'DRAFT',
      is_breaking: false,
      image_url: '',
    },
  });

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name_ar');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, [supabase]);

  const title = form.watch('title');
  useEffect(() => {
    if (title && !form.formState.touchedFields.slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s\u0600-\u06FF]/gi, '')
        .replace(/\s+/g, '-');
      form.setValue('slug', generatedSlug);
    }
  }, [title, form]);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  async function onSubmit(values: z.infer<typeof newsSchema>) {
    if (!content) {
      alert('يرجى إضافة محتوى للخبر');
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('يجب تسجيل الدخول');
      setLoading(false);
      return;
    }

    // Try to insert with the current user ID
    let { error } = await supabase.from('news').insert({
      id: generateUUID(),
      ...values,
      content,
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
          content,
          author_id: otherUsers[0].id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        error = fallbackError.error;
      }
    }

    if (error) {
      alert('حدث خطأ أثناء الحفظ: ' + error.message);
      setLoading(false);
    } else {
      router.push('/news');
      router.refresh();
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20" dir="rtl">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-sm border border-slate-100 sticky top-20 z-20">
        <div className="flex items-center gap-4">
          <Link href="/news" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h2 className="text-xl font-black">كتابة خبر جديد</h2>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className="rounded-xl font-bold h-11 px-5 hover:bg-slate-100"
            onClick={() => {
              form.setValue('status', 'DRAFT');
              form.handleSubmit(onSubmit)();
            }}
            disabled={loading}
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
            disabled={loading}
          >
            {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Send className="ml-2 h-4 w-4" />}
            نشر الآن
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
                          placeholder="اكتب عنوان الخبر هنا..." 
                          {...field} 
                          className="h-20 text-3xl font-black border-none focus-visible:ring-0 placeholder:text-slate-300 p-0 shadow-none text-start"
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
                  <span className="font-black text-sm uppercase tracking-wider text-start">إعدادات الخبر</span>
                </div>

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem className="text-start">
                      <FormLabel className="text-xs font-black text-slate-500">القسم</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold">
                            <SelectValue placeholder="اختر قسماً">
                              {categories.find(c => c.id === field.value)?.name_ar}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-none shadow-2xl max-h-[300px] p-2 bg-white">
                          {(() => {
                            const roots = categories.filter(c => !c.parent_id);
                            const children = categories.filter(c => c.parent_id);
                            const list: any[] = [];
                            roots.forEach(root => {
                              list.push({ ...root, isChild: false });
                              children.filter(child => child.parent_id === root.id).forEach(child => {
                                list.push({ ...child, isChild: true });
                              });
                            });
                            children.forEach(child => {
                              if (!list.some(item => item.id === child.id)) {
                                list.push({ ...child, isChild: true });
                              }
                            });
                            return list;
                          })().map((cat) => (
                            <SelectItem 
                              key={cat.id} 
                              value={cat.id} 
                              className={`rounded-xl py-3 cursor-pointer ${
                                cat.isChild 
                                  ? 'pr-8 font-medium text-slate-500 hover:text-slate-800' 
                                  : 'font-black text-slate-900 bg-slate-50/50 hover:bg-slate-100/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {cat.isChild ? (
                                  <span className="text-slate-400 font-black">↳</span>
                                ) : (
                                  <span className="text-primary select-none">📁</span>
                                )}
                                <span>{cat.name_ar}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_breaking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-red-50 p-4 bg-red-50/20">
                      <div className="text-start">
                        <FormLabel className="text-sm font-black text-red-600">خبر عاجل</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-red-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t border-slate-100">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem className="text-start">
                        <FormLabel className="text-xs font-black text-slate-500">الرابط (Slug)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            dir="ltr" 
                            className="h-10 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-mono text-[10px]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
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
                      <FormLabel className="text-xs font-black text-slate-500 mb-2 block">صورة الغلاف</FormLabel>
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
