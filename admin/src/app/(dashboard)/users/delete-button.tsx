'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteUserAction } from '@/app/actions/users';
import { useRouter } from 'next/navigation';

export default function DeleteUserButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) {
      startTransition(async () => {
        try {
          await deleteUserAction(userId);
          router.refresh();
        } catch (error: any) {
          alert(error.message || 'حدث خطأ أثناء حذف المستخدم');
        }
      });
    }
  };

  return (
    <Button 
      onClick={handleDelete}
      disabled={isPending}
      variant="ghost" 
      size="icon" 
      className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-600"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
      )}
    </Button>
  );
}
