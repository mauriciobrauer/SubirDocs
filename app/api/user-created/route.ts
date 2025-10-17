import { NextResponse } from 'next/server';

// Variable global para almacenar el timestamp del último usuario creado
let lastUserCreatedTimestamp = 0;

export async function POST() {
  try {
    // Actualizar el timestamp cuando se crea un usuario
    lastUserCreatedTimestamp = Date.now();
    
    return NextResponse.json({
      success: true,
      timestamp: lastUserCreatedTimestamp,
      message: 'Usuario creado notificado'
    });
  } catch (error) {
    console.error('Error notificando creación de usuario:', error);
    return NextResponse.json({ 
      error: 'Error notificando creación de usuario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      lastUserCreatedTimestamp
    });
  } catch (error) {
    console.error('Error obteniendo timestamp:', error);
    return NextResponse.json({ 
      error: 'Error obteniendo timestamp',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
