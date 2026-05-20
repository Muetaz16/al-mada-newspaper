import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search,
  Filter,
  Calendar,
  User as UserIcon,
  Tag,
  Eye,
  Layers
} from 'lucide-react';
import { prisma } from '@/utils/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NewsActions } from '@/components/news-actions';

export const dynamic = 'force-dynamic';

export default async function AnalysesPage() {
  const newsItems = await prisma.news.findMany({
    where: {
      category: {
        slug: 'analyses'
      }
    },
    include: {
      author: {
        select: { name: true }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-primary" />
            أبعد مدى (المقالات)
          </h2>
          <p className="text-muted-foreground text-sm font-bold mt-1">إدارة التحليلات والمقالات السياسية المعمقة لخبراء المدى</p>
        </div>
        <Button render={<Link href="/analyses/create" />} className="font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
          <Plus className="ml-2 h-5 w-5" />
          إضافة مقال جديد
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-6 border-b border-muted/30 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full md:w-96 text-start">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="البحث في المقالات..." 
                className="pr-10 h-11 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/10 font-bold"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-b border-muted/30">
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">المقال</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">بواسطة</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">الحالة</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">المشاهدات</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">التاريخ</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center text-muted-foreground font-bold">
                      لا توجد مقالات حالياً
                    </TableCell>
                  </TableRow>
                )}
                {newsItems.map((news) => (
                  <TableRow key={news.id} className="hover:bg-slate-50/50 transition-colors border-b border-muted/20 last:border-none">
                    <TableCell className="py-5 px-6 text-start">
                      <p className="font-black text-slate-900 line-clamp-1 hover:text-primary transition-colors cursor-default">{news.title}</p>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-start">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-600">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        {news.author?.name || 'مجهول'}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-start">
                      <Badge className={cn(
                        "font-black text-[10px] px-3 py-1 rounded-lg border-none shadow-sm",
                        news.status === 'PUBLISHED' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                      )}>
                        {news.status === 'PUBLISHED' ? 'منشور' : 'مسودة'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-start">
                      <div className="flex items-center gap-1.5 font-black text-xs text-slate-700">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {news.view_count ? news.view_count.toLocaleString() : 0}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-start">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(news.created_at).toLocaleDateString('en-GB')}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <NewsActions newsId={news.id} authorId={news.author_id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
