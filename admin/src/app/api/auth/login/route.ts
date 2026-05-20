import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { signJWT } from '@/utils/jwt';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبة' }, { status: 400 });
    }

    // Normalize email: convert to lowercase and remove spaces
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[AUTH] Login attempt for email: "${normalizedEmail}"`);

    // 1. Fetch user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.warn(`[AUTH] Login failed: No user found in database with email "${normalizedEmail}"`);
      return NextResponse.json({ error: 'خطأ في البريد الإلكتروني أو كلمة المرور' }, { status: 401 });
    }

    if (!user.password_hash) {
      console.warn(`[AUTH] Login failed: User "${normalizedEmail}" exists but has no password_hash stored`);
      return NextResponse.json({ error: 'خطأ في البريد الإلكتروني أو كلمة المرور' }, { status: 401 });
    }

    // 2. Verify password using bcryptjs
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      console.warn(`[AUTH] Login failed: Incorrect password provided for "${normalizedEmail}"`);
      return NextResponse.json({ error: 'خطأ في البريد الإلكتروني أو كلمة المرور' }, { status: 401 });
    }

    console.log(`[AUTH] Login successful for user: "${normalizedEmail}" (Role: ${user.role})`);

    // 3. Sign JWT
    const token = await signJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 4. Set HttpOnly Cookie
    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
    
    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('[AUTH] Custom login error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تسجيل الدخول' }, { status: 500 });
  }
}
