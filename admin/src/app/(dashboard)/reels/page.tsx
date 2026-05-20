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
  Calendar,
  Film,
  Play,
  Eye
} from 'lucide-react';
import { prisma } from '@/utils/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ReelActions } from '@/components/reel-actions';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function ReelsPage() {
  const reels = await prisma.reel.findMany({
    orderBy: {
      created_at: 'desc'
    }
  });

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Film className="w-8 h-8 text-primary" />
            بإيجاز (ريلز)
          </h2>
          <p className="text-muted-foreground text-sm font-bold mt-1">إدارة الفيديوهات القصيرة التي تفسر الخبر</p>
        </div>
        <Button render={<Link href="/reels/create" />} className="font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
          <Plus className="ml-2 h-5 w-5" />
          إضافة ريل جديد
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-6 border-b border-muted/30 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="البحث في الريلز..." 
                className="pr-10 h-11 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/10 font-bold text-start"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-b border-muted/30">
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">الفيديو</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">المشاهدات</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">التاريخ</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center text-muted-foreground font-bold">
                      لا توجد فيديوهات حالياً
                    </TableCell>
                  </TableRow>
                )}
                {reels.map((reel) => (
                  <TableRow key={reel.id} className="hover:bg-slate-50/50 transition-colors border-b border-muted/20 last:border-none">
                    <TableCell className="py-5 px-6 text-start">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-24 rounded-xl overflow-hidden shadow-lg shrink-0">
                          <Image
                            src={reel.thumbnail || 'https://images.unsplash.com/photo-1485846234645-a62644f84728'}
                            alt={reel.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        </div>
                        <p className="font-black text-slate-900 leading-tight">{reel.title}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-start">
                      <div className="flex items-center gap-1.5 font-black text-xs text-slate-700">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {(reel.views || 0).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-start font-bold text-xs text-slate-500">
                      {new Date(reel.created_at).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <ReelActions reelId={reel.id} />
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
