'use server';

import { Role } from '@/utils/permissions';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/utils/jwt';
import { prisma } from '@/utils/prisma';

async function ensureSuperAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie) {
    throw new Error('غير مصرح بالوصول: يجب تسجيل الدخول أولاً');
  }

  const payload = await verifyJWT(sessionCookie.value);
  if (!payload || !payload.id) {
    throw new Error('غير مصرح بالوصول: جلسة غير صالحة');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { role: true },
  });

  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Error('غير مصرح بالوصول: هذه العملية مخصصة لمدير النظام (Super Admin) فقط');
  }
}

export async function createUserAction(formData: FormData) {
  try {
    await ensureSuperAdmin();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as Role;

    if (!email || !password || !name || !role) {
      return { success: false, error: 'جميع الحقول مطلوبة' };
    }

    if (password.trim().length < 6) {
      return { success: false, error: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        password_hash: passwordHash,
      },
    });

    return { success: true, user };
  } catch (error: any) {
    console.error('Database insertion error:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'البريد الإلكتروني مسجل بالفعل' };
    }
    return { success: false, error: error.message || 'خطأ في إنشاء حساب المستخدم' };
  }
}

export async function updateUserAction(id: string, name: string, role: Role, password?: string) {
  await ensureSuperAdmin();
  if (!id || !name || !role) {
    throw new Error('جميع الحقول مطلوبة للتعديل');
  }

  try {
    const dataToUpdate: any = {
      name,
      role,
    };

    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        throw new Error('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      }
      dataToUpdate.password_hash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return { success: true, user };
  } catch (error: any) {
    console.error('Database update error:', error);
    throw new Error(error.message || 'خطأ في تحديث قاعدة البيانات');
  }
}

export async function deleteUserAction(id: string) {
  await ensureSuperAdmin();
  if (!id) {
    throw new Error('معرف المستخدم مطلوب للحذف');
  }

  try {
    const user = await prisma.user.delete({
      where: { id },
    });
    return { success: true, user };
  } catch (error: any) {
    console.error('Database deletion error:', error);
    throw new Error('خطأ في حذف المستخدم: ' + error.message);
  }
}
