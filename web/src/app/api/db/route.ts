import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const adminUrl = process.env.ADMIN_API_URL || 'https://al-mada-newspaper-production.up.railway.app';

    const res = await fetch(`${adminUrl}/api/db`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-token': process.env.API_SECRET_TOKEN || 'fallback-secret-for-local-dev'
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { data: null, error: { message: errText } },
        { status: res.status }
      );
    }

    const payload = await res.json();
    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('Web DB Proxy Error:', error);
    return NextResponse.json(
      { data: null, error: { message: error.message || 'Bridge connection error' } },
      { status: 200 }
    );
  }
}
