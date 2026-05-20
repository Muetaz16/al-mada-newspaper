import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pulseCount = await prisma.pulseOfLife.count();
    const newsCount = await prisma.news.count();
    const items = await prisma.pulseOfLife.findMany({
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      status: 'ok',
      buildTime: '2026-05-20T18:55:00Z',
      database: {
        pulseCount,
        newsCount,
        items
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
}
