import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Probando inicialización de Firebase...');
    
    // Intentar importar Firebase
    const { auth, firebaseConfig } = await import('@/lib/firebase');
    
    return NextResponse.json({
      success: true,
      message: 'Firebase se inicializó correctamente',
      firebaseConfig: {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        apiKey: firebaseConfig.apiKey.substring(0, 10) + '...' // Solo mostrar parte de la API key
      },
      authAvailable: !!auth,
      nextSteps: [
        '1. Descargar credenciales de servicio desde Firebase Console',
        '2. Guardar como firebase-service-account.json en la raíz del proyecto',
        '3. O configurar FIREBASE_SERVICE_ACCOUNT_KEY en variables de entorno',
        '4. Ejecutar migración de usuarios'
      ]
    });
    
  } catch (error: any) {
    console.error('❌ Error probando Firebase:', error);
    return NextResponse.json({
      success: false,
      error: 'Error inicializando Firebase',
      details: error.message,
      instructions: [
        'Para configurar Firebase correctamente:',
        '1. Ve a https://console.firebase.google.com/',
        '2. Selecciona tu proyecto: prueba-autenticacion-2d6a5',
        '3. Ve a Configuración del proyecto > Cuentas de servicio',
        '4. Genera nueva clave privada',
        '5. Descarga el JSON y guárdalo como firebase-service-account.json'
      ]
    }, { status: 500 });
  }
}
