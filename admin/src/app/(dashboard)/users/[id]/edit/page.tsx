import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/utils/jwt';
import { prisma } from '@/utils/prisma';
import EditUserForm from './edit-form';
import { Role } from '@/utils/permissions';

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
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

  // 1. Verify that the current user is a Super Admin
  const profile = await prisma.user.findUnique({
    where: { id: authUserId }
  });

  if (!profile || profile.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  // 2. Fetch the target user details to edit
  const targetUser = await prisma.user.findUnique({
    where: { id }
  });

  if (!targetUser) {
    notFound();
  }

  return (
    <EditUserForm 
      user={{
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role as Role
      }} 
    />
  );
}
