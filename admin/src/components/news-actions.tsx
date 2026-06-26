'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye,
  Loader2,
  Copy
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { canEditPost, canDeletePost } from '@/utils/permissions';

export function NewsActions({ newsId, authorId }: { newsId: string; authorId?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { user, loading: userLoading } = useUser();

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;
    
    setLoading(true);
    const { error } = await supabase.from('news').delete().eq('id', newsId);
    
    if (error) {
      alert('خطأ في الحذف: ' + error.message);
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  const showEdit = user && authorId ? canEditPost(user, authorId) : (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN');
  const showDelete = user && authorId ? canDeletePost(user, authorId) : (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN');

  if (userLoading) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100" disabled>
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <MoreHorizontal className="h-5 w-5 text-slate-400" />}
        </Button>
      } />
      <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 min-w-[160px]">
        <DropdownMenuItem className="rounded-xl py-2.5 font-bold gap-3 text-start" onClick={() => {
          navigator.clipboard.writeText(`https://almadanews.ly/news/${newsId}`);
          alert('تم نسخ الرابط بنجاح');
        }}>
          <Copy className="h-4 w-4 text-slate-400" />
          نسخ الرابط
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl py-2.5 font-bold gap-3 text-start">
          <Eye className="h-4 w-4 text-slate-400" />
          عرض الخبر
        </DropdownMenuItem>
        {showEdit && (
          <DropdownMenuItem render={<Link href={`/news/${newsId}/edit`} />} className="rounded-xl py-2.5 font-bold gap-3 text-start">
            <Pencil className="h-4 w-4 text-slate-400" />
            تعديل الخبر
          </DropdownMenuItem>
        )}
        {showDelete && (
          <DropdownMenuItem 
            variant="destructive" 
            className="rounded-xl py-2.5 font-bold gap-3 text-start"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            حذف الخبر
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
