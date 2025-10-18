import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Simular que se creó un usuario para forzar la actualización
    const timestamp = Date.now();
    
    return NextResponse.json({
      success: true,
      message: 'Lista de usuarios actualizada forzadamente',
      timestamp: timestamp,
      lastUserCreatedTimestamp: timestamp
    });
  } catch (error) {
    console.error('Error forzando actualización:', error);
    return NextResponse.json({ 
      error: 'Error forzando actualización',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
