import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar,
  Clock,
  MoreVertical,
  Plus,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { prisma } from '@/utils/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Parallel fetching for maximum speed directly via Prisma Client!
  const [newsCount, viewsResult, usersCount, categoriesCount, recentNews, allNewsDates] = await Promise.all([
    prisma.news.count(),
    prisma.news.findMany({ select: { view_count: true } }),
    prisma.user.count(),
    prisma.category.count(),
    prisma.news.findMany({
      include: {
        category: {
          select: {
            name_ar: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 5,
    }),
    prisma.news.findMany({
      select: {
        created_at: true,
      },
    }),
  ]);

  const totalViews = viewsResult.reduce((acc, curr) => acc + (curr.view_count || 0), 0);

  // Group news by day of the week (0: Sun, 1: Mon, ..., 6: Sat)
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  allNewsDates.forEach((item) => {
    if (item.created_at) {
      const day = new Date(item.created_at).getDay();
      dayCounts[day] += 1;
    }
  });

  const maxCount = Math.max(...dayCounts, 1);
  const dayMapping = [6, 0, 1, 2, 3, 4, 5]; // Sat, Sun, Mon, Tue, Wed, Thu, Fri
  const chartPercentages = dayMapping.map((dayNum) => Math.round((dayCounts[dayNum] / maxCount) * 100));
  const chartCounts = dayMapping.map((dayNum) => dayCounts[dayNum]);

  const stats = [
    {
      title: 'إجمالي الأخبار',
      value: newsCount,
      icon: FileText,
      trend: '+12.5%',
      isPositive: true,
      color: 'bg-blue-500',
    },
    {
      title: 'المستخدمين',
      value: usersCount,
      icon: Users,
      trend: '+5',
      isPositive: true,
      color: 'bg-green-500',
    },
    {
      title: 'الأقسام',
      value: categoriesCount,
      icon: TrendingUp,
      trend: 'ثابت',
      isPositive: true,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">مرحباً بك في لوحة التحكم</h1>
          <p className="text-muted-foreground text-sm font-bold">نظرة عامة على أداء صحيفة المدى اليوم</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-bold border-2 rounded-xl h-11 px-5 bg-white">
            <Calendar className="ml-2 h-4 w-4" />
            آخر 30 يوم
          </Button>
          <Button render={<Link href="/news/create" />} className="font-bold shadow-lg shadow-primary/20 rounded-xl h-11 px-5">
            <Plus className="ml-2 h-4 w-4" />
            خبر جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="group relative overflow-hidden border-none shadow-xl bg-white transition-all hover:translate-y-[-4px] duration-300 rounded-[2rem]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} text-white p-3 rounded-2xl shadow-lg shadow-inherit/20`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.trend}
                </div>
              </div>
              <div className="space-y-1 text-start">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wide">{stat.title}</p>
                <h3 className="text-3xl font-black tabular-nums tracking-tighter">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-muted/30 p-8">
            <div className="text-start">
              <CardTitle className="text-xl font-black">أحدث المقالات</CardTitle>
              <CardDescription className="font-bold mt-1 text-xs">آخر الأخبار التي تم إضافتها للموقع</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="font-black text-primary hover:bg-primary/5" render={<Link href="/news" />}>
              عرض الكل
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-muted/30">
              {recentNews?.length === 0 && (
                <div className="p-20 text-center text-muted-foreground font-bold">لا يوجد أخبار حديثة</div>
              )}
              {recentNews?.map((news) => (
                <div key={news.id} className="p-6 flex items-center justify-between hover:bg-slate-50/80 transition-all group">
                  <div className="flex items-center gap-5 text-start">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                      {news.category?.name_ar?.substring(0, 1) || 'خ'}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-base text-slate-800 group-hover:text-primary transition-colors line-clamp-1">{news.title}</h4>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(news.created_at).toLocaleDateString('en-GB')}
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">
                          <Layers className="w-3.5 h-3.5" />
                          {news.category?.name_ar}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm ${news.status === 'PUBLISHED' ? 'bg-green-500 text-white shadow-green-200' : 'bg-amber-500 text-white shadow-amber-200'}`}>
                      {news.status === 'PUBLISHED' ? 'منشور' : 'مسودة'}
                    </div>
                    <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-4">
            <div className="text-start">
              <CardTitle className="text-xl font-black">نشاط النشر</CardTitle>
              <CardDescription className="text-slate-400 font-bold mt-1 text-xs text-start">توزيع المقالات المنشورة حسب اليوم</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
            <div className="h-56 flex items-end justify-between gap-3 mt-6">
              {chartPercentages.map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                  <div 
                    className="w-full bg-white/10 rounded-2xl group-hover:bg-primary transition-all duration-700 relative shadow-lg" 
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-black py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 whitespace-nowrap">
                      {chartCounts[i]} خبر ({height}%)
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-slate-500 group-hover:text-primary transition-colors">{['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'][i]}</span>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Layers(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}
