import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/utils/jwt';
import { prisma } from '@/utils/prisma';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifyJWT(sessionCookie.value);

    if (!payload || !payload.id) {
      return NextResponse.json({ user: null });
    }

    // Fetch up-to-date profile details from the database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar_url: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Verify session API error:', error);
    return NextResponse.json({ user: null });
  }
}
