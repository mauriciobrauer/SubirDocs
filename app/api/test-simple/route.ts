import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Endpoint simple funcionando',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      hasFirebaseKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    }
  });
}
