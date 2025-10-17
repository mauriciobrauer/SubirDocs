import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Log todos los datos recibidos
    console.log('=== DEBUG WEBHOOK RECIBIDO ===');
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
    // También logear headers
    console.log('=== HEADERS ===');
    Array.from(request.headers.entries()).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
    const logs = [];
    logs.push('=== DEBUG WEBHOOK RECIBIDO ===');
    Array.from(formData.entries()).forEach(([key, value]) => {
      logs.push(`${key}: ${value}`);
    });
    
    logs.push('=== HEADERS ===');
    Array.from(request.headers.entries()).forEach(([key, value]) => {
      logs.push(`${key}: ${value}`);
    });
    
    return new NextResponse(logs.join('\n'), { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
    
  } catch (error) {
    console.error('Error en debug webhook:', error);
    return new NextResponse(`Error: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
}
