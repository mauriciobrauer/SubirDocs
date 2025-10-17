import { NextResponse } from 'next/server';

// Variable global para almacenar logs de Dropbox
let dropboxLogs: Array<{
  timestamp: string;
  message: string;
  error?: any;
  phoneNumber?: string;
  fileName?: string;
}> = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Agregar nuevo log
    dropboxLogs.push({
      timestamp: new Date().toISOString(),
      ...body
    });
    
    // Mantener solo los últimos 50 logs
    if (dropboxLogs.length > 50) {
      dropboxLogs = dropboxLogs.slice(-50);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Log agregado'
    });
  } catch (error) {
    console.error('Error agregando log de Dropbox:', error);
    return NextResponse.json({ 
      error: 'Error agregando log',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      logs: dropboxLogs,
      count: dropboxLogs.length
    });
  } catch (error) {
    console.error('Error obteniendo logs de Dropbox:', error);
    return NextResponse.json({ 
      error: 'Error obteniendo logs',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
