import { NextResponse } from 'next/server';

// Variable global para almacenar el estado de procesamiento
let processingStatus = {
  isProcessing: false,
  phoneNumber: '',
  fileName: '',
  messageSid: '',
  status: '', // 'received', 'creating_user', 'saving_file', 'uploading_dropbox', 'completed', 'error'
  timestamp: 0,
  error: ''
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Actualizar el estado de procesamiento
    processingStatus = {
      ...processingStatus,
      ...body,
      timestamp: Date.now()
    };
    
    return NextResponse.json({
      success: true,
      status: processingStatus
    });
  } catch (error) {
    console.error('Error actualizando estado de procesamiento:', error);
    return NextResponse.json({ 
      error: 'Error actualizando estado de procesamiento',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      status: processingStatus
    });
  } catch (error) {
    console.error('Error obteniendo estado de procesamiento:', error);
    return NextResponse.json({ 
      error: 'Error obteniendo estado de procesamiento',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
