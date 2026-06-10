'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Loader2, Save, UserPlus, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { createUserAction } from '@/app/actions/users';

export default function CreateUserPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    try {
      const res = await createUserAction(formData);
      if (res && res.success === false) {
        setError(res.error || 'حدث خطأ أثناء إنشاء المستخدم');
        setLoading(false);
        return;
      }
      router.push('/users');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20" dir="rtl">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-sm border border-slate-100 sticky top-20 z-20">
        <div className="flex items-center gap-4">
          <Link href="/users" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <h2 className="text-xl font-black">إضافة مستخدم جديد</h2>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4 text-start">
          <CardTitle className="text-2xl font-black flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-primary" />
            بيانات الحساب الجديد
          </CardTitle>
          <CardDescription className="font-bold text-xs">
            قم بملء البيانات التالية لتسجيل عضو جديد في فريق العمل
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6 text-start">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-4 rounded-2xl text-center font-bold flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500">الاسم الكامل</label>
              <Input 
                name="name" 
                placeholder="مثال: أحمد محمد" 
                required 
                className="h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500">البريد الإلكتروني</label>
              <Input 
                type="email"
                name="email" 
                placeholder="name@example.com" 
                required 
                className="h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 font-bold"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500">كلمة المرور المؤقتة</label>
              <Input 
                type="password"
                name="password" 
                placeholder="••••••••" 
                required 
                className="h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 font-bold"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500">الصلاحية والمسؤولية</label>
              <select 
                name="role" 
                required 
                className="w-full h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 font-bold px-4 appearance-none outline-none cursor-pointer"
              >
                <option value="SUPER_ADMIN">مدير النظام (Super Admin)</option>
                <option value="ADMIN">رئيس التحرير (Admin)</option>
                <option value="USER">مستخدم عادي</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-50 flex justify-end gap-2">
              <Button 
                type="submit" 
                className="rounded-xl font-black h-12 px-8 shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="ml-2 h-4 w-4" />
                )}
                إنشاء الحساب
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
