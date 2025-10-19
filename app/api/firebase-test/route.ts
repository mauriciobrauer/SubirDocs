import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔥 === TEST FIREBASE SIMPLE ===');
    
    // Verificar variables de entorno
    const hasServiceAccountKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    console.log(`🔑 FIREBASE_SERVICE_ACCOUNT_KEY: ${hasServiceAccountKey}`);
    
    if (!hasServiceAccountKey) {
      return NextResponse.json({
        success: false,
        error: 'FIREBASE_SERVICE_ACCOUNT_KEY no configurada'
      });
    }
    
    // Intentar importar Firebase
    try {
      const { createFirebaseUser } = await import('@/lib/firebase-users');
      console.log('✅ Firebase users module importado');
      
      // Crear usuario de prueba
      const testEmail = 'test@whatsapp.local';
      const testPhone = '5213334987878';
      
      console.log(`🔄 Creando usuario: ${testEmail}`);
      const user = await createFirebaseUser(testEmail, testPhone, testPhone);
      
      return NextResponse.json({
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }
      });
      
    } catch (error: any) {
      console.error('❌ Error Firebase:', error.message);
      return NextResponse.json({
        success: false,
        error: error.message,
        stack: error.stack
      }, { status: 500 });
    }
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
