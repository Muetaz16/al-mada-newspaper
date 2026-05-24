'use client';

import { useState, useEffect, use } from 'react';
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
import { Loader2, Save, Send, ArrowRight, Trash2, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/image-upload';
import { canEditPost, canDeletePost } from '@/utils/permissions';

const newsSchema = z.object({
  title: z.string().min(5, 'العنوان قصير جداً'),
  subtitle: z.string().optional(),
  slug: z.string().min(2, 'الرابط قصير جداً'),
  category_id: z.string().min(1, 'يرجى اختيار قسم'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  is_breaking: z.boolean(),
  image_url: z.string().optional(),
});

export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [content, setContent] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
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
    async function fetchData() {
      setFetching(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }

      const [newsResponse, categoriesResponse, profileResponse] = await Promise.all([
        supabase.from('news').select('*').eq('id', id).single(),
        supabase.from('categories').select('*'),
        supabase.from('users').select('*').eq('id', authUser.id).single(),
      ]);

      if (profileResponse.data) setUserProfile(profileResponse.data);
      if (categoriesResponse.data) setCategories(categoriesResponse.data);
      
      if (newsResponse.data) {
        const news = newsResponse.data;
        
        // Authorization check
        const profile = profileResponse.data;
        if (!canEditPost(profile, news.author_id)) {
          alert('غير مصرح لك بتعديل هذا الخبر');
          router.push('/news');
          return;
        }

        form.reset({
          title: news.title,
          subtitle: news.subtitle || '',
          slug: news.slug,
          category_id: news.category_id,
          status: news.status,
          is_breaking: news.is_breaking || false,
          image_url: news.image_url || '',
        });
        setContent(news.content);
      } else {
        alert('لم يتم العثور على الخبر');
        router.push('/news');
      }
      setFetching(false);
    }
    fetchData();
  }, [id, supabase, form, router]);

  async function onSubmit(values: z.infer<typeof newsSchema>) {
    if (!content) {
      alert('يرجى إضافة محتوى للخبر');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('news')
      .update({
        ...values,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      alert('حدث خطأ أثناء التعديل: ' + error.message);
      setLoading(false);
    } else {
      router.push('/news');
      router.refresh();
    }
  }

  async function deleteNews() {
    if (!userProfile || !canDeletePost(userProfile)) {
      alert('غير مصرح لك بحذف الأخبار');
      return;
    }
    if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;
    setLoading(true);
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      alert('خطأ في الحذف: ' + error.message);
      setLoading(false);
    } else {
      router.push('/news');
      router.refresh();
    }
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-bold text-slate-500">جاري تحميل بيانات الخبر...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-20" dir="rtl">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-sm border border-slate-100 sticky top-20 z-20">
        <div className="flex items-center gap-4">
          <Link href="/news" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h2 className="text-xl font-black">تعديل الخبر</h2>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className="rounded-xl font-bold h-11 px-6 text-destructive hover:bg-destructive/5"
            onClick={deleteNews}
            disabled={loading}
          >
            <Trash2 className="ml-2 h-4 w-4" />
            حذف
          </Button>
          <Button 
            className="rounded-xl font-black h-11 px-8 shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-3 space-y-6 text-start">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-8 space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="عنوان الخبر..." 
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
                  <span className="font-black text-sm uppercase tracking-wider text-start">إعدادات النشر</span>
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="text-start">
                      <FormLabel className="text-xs font-black text-slate-500">الحالة</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-bold">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          <SelectItem value="DRAFT" className="font-bold rounded-lg py-3 text-amber-600">مسودة</SelectItem>
                          <SelectItem value="PUBLISHED" className="font-bold rounded-lg py-3 text-green-600">منشور</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

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
                        <SelectContent className="rounded-xl border-none shadow-2xl">
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
                            <SelectItem key={cat.id} value={cat.id} className="font-bold rounded-lg py-3">
                              {cat.isChild ? `↳ ${cat.name_ar}` : cat.name_ar}
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
                      <FormLabel className="text-xs font-black text-slate-500 mb-2 block text-start">صورة الغلاف</FormLabel>
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
