import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'webhook-log.txt');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const timestamp = new Date().toISOString();
    
    const logEntry = {
      timestamp,
      headers: Object.fromEntries(request.headers.entries()),
      data: Object.fromEntries(formData.entries())
    };
    
    // Escribir al archivo de log
    fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + '\n---\n');
    
    console.log('📝 Webhook logueado:', timestamp);
    
    return new NextResponse(`Webhook logueado: ${timestamp}`, { status: 200 });
    
  } catch (error) {
    console.error('Error en webhook log:', error);
    return new NextResponse('Error', { status: 500 });
  }
}

export async function GET() {
  try {
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf-8');
      return new NextResponse(content, { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    } else {
      return new NextResponse('No hay logs aún', { status: 200 });
    }
  } catch (error) {
    return new NextResponse('Error leyendo logs', { status: 500 });
  }
}
