'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Radio, Loader2, Lock, Mail, ChevronLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'خطأ في البريد الإلكتروني أو كلمة المرور');
      }

      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10 p-4">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 mb-4 shadow-xl">
            <Radio className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">صحيفة المدى</h1>
          <p className="text-slate-500 font-bold mt-2 italic">نظام إدارة المحتوى المتطور</p>
        </div>

        <Card className="border border-slate-100 shadow-[0_30px_70px_rgba(0,0,0,0.05)] bg-white text-slate-900 rounded-[2.5rem]">
          <CardHeader className="space-y-2 text-center pt-8">
            <CardTitle className="text-2xl font-black text-slate-900">مرحباً بعودتك</CardTitle>
            <CardDescription className="text-slate-500 font-medium">أدخل بياناتك للمتابعة إلى لوحة التحكم</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-4 rounded-2xl text-center font-bold animate-shake">
                  {error}
                </div>
              )}
              
              <div className="space-y-3">
                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 pr-12 bg-slate-50 border-slate-100 focus:border-primary/50 focus:ring-primary/20 rounded-2xl text-right font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 pr-12 bg-slate-50 border-slate-100 focus:border-primary/50 focus:ring-primary/20 rounded-2xl text-right font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-2">
                <button type="button" className="text-primary font-bold hover:underline">نسيت كلمة المرور؟</button>
                <div className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="rounded bg-slate-50 border-slate-200" id="remember" />
                  <label htmlFor="remember" className="font-bold">تذكرني</label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-2xl shadow-lg shadow-primary/20 group transition-all"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ChevronLeft className="ml-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span>دخول النظام</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-[10px] mt-8 font-bold uppercase tracking-widest">
          Injaz CMS v2.0 &bull; Powered by Antigravity AI
        </p>
      </div>
    </div>
  );
}
