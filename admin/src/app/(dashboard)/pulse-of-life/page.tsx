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
  MessageCircleQuestion,
  Heart,
  ChevronLeft
} from 'lucide-react';
import { prisma } from '@/utils/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PulseActions } from '@/components/pulse-actions';

export default async function PulseOfLifePage() {
  const items = await prisma.pulseOfLife.findMany({
    orderBy: {
      created_at: 'desc'
    }
  });

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary fill-primary/10" />
            نبض الحياة
          </h2>
          <p className="text-muted-foreground text-sm font-bold mt-1">إدارة قسم سؤال وجواب عن الصحة والجمال</p>
        </div>
        <Button render={<Link href="/pulse-of-life/create" />} className="font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
          <Plus className="ml-2 h-5 w-5" />
          إضافة سؤال جديد
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-6 border-b border-muted/30 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="البحث في الأسئلة..." 
                className="pr-10 h-11 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/10 font-bold text-start"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-b border-muted/30">
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">السؤال</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">التصنيف</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">التاريخ</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center text-muted-foreground font-bold">
                      لا توجد أسئلة حالياً
                    </TableCell>
                  </TableRow>
                )}
                {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-muted/20 last:border-none">
                    <TableCell className="py-5 px-6 text-start">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                          <MessageCircleQuestion className="w-5 h-5 text-primary" />
                        </div>
                        <p className="font-black text-slate-900 leading-tight mt-2">{item.question}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-start">
                      <Badge className="bg-slate-100 text-slate-600 border-none font-bold px-3 py-1 rounded-lg">
                        {item.category || 'عام'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-start font-bold text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <PulseActions pulseId={item.id} />
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
