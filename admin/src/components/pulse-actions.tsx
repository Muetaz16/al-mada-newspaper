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
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { canDeletePost } from '@/utils/permissions';

export function PulseActions({ pulseId }: { pulseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { user, loading: userLoading } = useUser();

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    
    setLoading(true);
    const { error } = await supabase.from('pulse_of_life').delete().eq('id', pulseId);
    
    if (error) {
      alert('خطأ في الحذف: ' + error.message);
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  const showDelete = user ? canDeletePost(user) : true;

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
        <DropdownMenuItem render={<Link href={`/pulse-of-life/${pulseId}/edit`} />} className="rounded-xl py-2.5 font-bold gap-3 text-start">
          <Pencil className="h-4 w-4 text-slate-400" />
          تعديل
        </DropdownMenuItem>
        {showDelete && (
          <DropdownMenuItem 
            variant="destructive" 
            className="rounded-xl py-2.5 font-bold gap-3 text-start"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
