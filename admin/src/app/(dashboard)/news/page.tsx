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
  Eye
} from 'lucide-react';
import { prisma } from '@/utils/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NewsActions } from '@/components/news-actions';

export default async function NewsPage() {
  const newsItems = await prisma.news.findMany({
    include: {
      author: {
        select: { name: true }
      },
      category: {
        select: { name_ar: true }
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
          <h2 className="text-3xl font-black tracking-tight">إدارة الأخبار</h2>
          <p className="text-muted-foreground text-sm font-bold mt-1">عرض وتعديل كافة المقالات المنشورة في الموقع</p>
        </div>
        <Button render={<Link href="/news/create" />} className="font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
          <Plus className="ml-2 h-5 w-5" />
          إضافة خبر جديد
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-6 border-b border-muted/30 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="البحث عن عنوان خبر..." 
                className="pr-10 h-11 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/10 font-bold"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" className="rounded-xl font-bold h-11 border-2 bg-white flex-1 md:flex-none">
                <Filter className="ml-2 h-4 w-4" />
                تصفية
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-b border-muted/30">
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">الخبر</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">التصنيف</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">بواسطة</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">الحالة</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">التاريخ</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center text-muted-foreground font-bold">
                      لا يوجد أخبار حالياً
                    </TableCell>
                  </TableRow>
                )}
                {newsItems.map((news) => (
                  <TableRow key={news.id} className="hover:bg-slate-50/50 transition-colors border-b border-muted/20 last:border-none">
                    <TableCell className="py-5 px-6 text-start">
                      <div className="space-y-1">
                        <p className="font-black text-slate-900 line-clamp-1 hover:text-primary transition-colors cursor-default">{news.title}</p>
                        {news.is_breaking && (
                          <span className="inline-flex items-center text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                            عاجل
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-start">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-600">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        {news.category?.name_ar}
                      </div>
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
