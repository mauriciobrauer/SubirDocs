import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔄 Probando Firebase en producción...');
    
    // Verificar variables de entorno
    const hasServiceAccountKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    console.log(`🔑 FIREBASE_SERVICE_ACCOUNT_KEY presente: ${hasServiceAccountKey}`);
    
    if (!hasServiceAccountKey) {
      return NextResponse.json({
        success: false,
        error: 'FIREBASE_SERVICE_ACCOUNT_KEY no está configurada',
        hasServiceAccountKey: false
      });
    }
    
    // Intentar inicializar Firebase
    try {
      const { auth } = await import('@/lib/firebase');
      console.log('✅ Firebase auth inicializado:', !!auth);
      
      // Intentar listar usuarios
      const listUsersResult = await auth.listUsers();
      console.log(`✅ Usuarios en Firebase: ${listUsersResult.users.length}`);
      
      return NextResponse.json({
        success: true,
        message: 'Firebase funcionando correctamente',
        hasServiceAccountKey: true,
        firebaseInitialized: true,
        userCount: listUsersResult.users.length,
        users: listUsersResult.users.map(user => ({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.metadata.creationTime
        }))
      });
      
    } catch (firebaseError: any) {
      console.error('❌ Error con Firebase:', firebaseError.message);
      return NextResponse.json({
        success: false,
        error: 'Error inicializando Firebase',
        details: firebaseError.message,
        hasServiceAccountKey: true,
        firebaseInitialized: false
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error en test-firebase-simple:', error);
    return NextResponse.json({
      success: false,
      error: 'Error en test-firebase-simple',
      details: error.message
    }, { status: 500 });
  }
}
