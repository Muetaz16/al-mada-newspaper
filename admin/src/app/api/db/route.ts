import { NextResponse } from 'next/server';
import { dispatchDbQuery } from '@/utils/db-dispatcher';
import { verifyJWT } from '@/utils/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // 1. Authenticate Request
    const tokenHeader = request.headers.get('x-api-token');
    const secretToken = process.env.API_SECRET_TOKEN || 'fallback-secret-for-local-dev';
    
    let isAuthorized = false;

    // Check 1: Server-to-server secret token (for Web App)
    if (tokenHeader && tokenHeader === secretToken) {
      isAuthorized = true;
    } else {
      // Check 2: Browser session cookie (for internal Admin client UI)
      const cookieStore = await cookies();
      const session = cookieStore.get('session');
      if (session) {
        const user = await verifyJWT(session.value);
        if (user) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized database proxy access' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { table, action, data, filters, order, limit, orders } = body;

    const result = await dispatchDbQuery(table, action, data, filters, order, limit, orders);
    return NextResponse.json({ data: result, error: null });
  } catch (error: any) {
    console.error('Prisma Proxy API Error:', error);
    return NextResponse.json(
      { data: null, error: { message: error.message || 'Database error' } },
      { status: 200 }
    );
  }
}
