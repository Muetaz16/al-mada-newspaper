import Link from 'next/link';
import { redirect } from 'next/navigation';
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
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar,
  Pencil,
  Trash2
} from 'lucide-react';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/utils/jwt';
import { prisma } from '@/utils/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { getRoleLabel } from '@/utils/permissions';
import DeleteUserButton from './delete-button';

export default async function UsersPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    redirect('/login');
  }

  const payload = await verifyJWT(sessionCookie.value);

  if (!payload || !payload.id) {
    redirect('/login');
  }

  const authUserId = payload.id;

  // 1. Verify user profile and role
  const profile = await prisma.user.findUnique({
    where: { id: authUserId }
  });

  if (!profile || profile.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4" dir="rtl">
        <div className="bg-red-50 p-6 rounded-full border border-red-100">
          <Shield className="w-16 h-16 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-800">غير مصرح بالوصول</h2>
        <p className="text-slate-500 font-bold max-w-md leading-relaxed">
          هذه لوحة تحكم سرية خاصة بمدير النظام فقط. الرجاء العودة إلى لوحة التحكم الرئيسية.
        </p>
        <Button render={<Link href="/" />} className="font-bold rounded-xl mt-4">
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  // 2. Fetch all users
  const users = await prisma.user.findMany({
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <UserIcon className="w-8 h-8 text-primary" />
            إدارة المستخدمين والصلاحيات
          </h2>
          <p className="text-muted-foreground text-sm font-bold mt-1">
            إضافة وتعديل صلاحيات ومسميات فريق عمل صحيفة المدى
          </p>
        </div>
        <Button render={<Link href="/users/create" />} className="font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 bg-primary">
          <Plus className="ml-2 h-5 w-5" />
          إضافة مستخدم جديد
        </Button>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-b border-muted/30">
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">الاسم</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">الصلاحية</TableHead>
                  <TableHead className="text-right py-5 px-6 font-black text-slate-800">تاريخ الإنشاء</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center text-muted-foreground font-bold">
                      لا يوجد مستخدمين مسجلين حالياً
                    </TableCell>
                  </TableRow>
                )}
                {users.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-muted/20 last:border-none">
                    <TableCell className="py-5 px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600 text-sm">
                          {item.name?.substring(0, 1) || 'ع'}
                        </div>
                        <p className="font-black text-slate-900 text-base">{item.name || 'بدون اسم'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-start">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {item.email}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-start">
                      <Badge className={`font-black text-[10px] px-3 py-1.5 rounded-xl border-none shadow-sm ${
                        item.role === 'SUPER_ADMIN' 
                          ? 'bg-red-500 text-white shadow-red-200' 
                          : item.role === 'ADMIN' || item.role === 'EDITOR' 
                            ? 'bg-blue-500 text-white shadow-blue-200' 
                            : 'bg-emerald-500 text-white shadow-emerald-200'
                      }`}>
                        {getRoleLabel(item.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-start">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-500">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(item.created_at).toLocaleDateString('en-GB')}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <Button 
                          render={<Link href={`/users/${item.id}/edit`} />}
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl hover:bg-slate-100"
                        >
                          <Pencil className="w-4 h-4 text-slate-500" />
                        </Button>
                        
                        {item.id !== authUserId && (
                          <DeleteUserButton userId={item.id} />
                        )}
                      </div>
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
