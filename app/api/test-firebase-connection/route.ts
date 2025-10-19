import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Probando conexión con Firebase...');
    
    // Intentar hacer una consulta básica a Firebase
    // Esto nos dirá si podemos conectarnos al proyecto
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/prueba-autenticacion-2d6a5/databases/(default)/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`📡 Respuesta de Firebase: ${response.status} ${response.statusText}`);
    
    if (response.status === 200 || response.status === 403) {
      // 403 es normal si no tenemos permisos, pero significa que el proyecto existe
      return NextResponse.json({
        success: true,
        message: 'Conexión con Firebase exitosa',
        projectId: 'prueba-autenticacion-2d6a5',
        status: response.status,
        note: 'El proyecto existe, pero necesitas credenciales de servicio para administrar usuarios'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Error conectando con Firebase',
        status: response.status,
        statusText: response.statusText
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('❌ Error probando conexión con Firebase:', error);
    return NextResponse.json({
      success: false,
      error: 'Error probando conexión con Firebase',
      details: error.message
    }, { status: 500 });
  }
}
