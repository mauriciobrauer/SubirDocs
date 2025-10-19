import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔥 === DEBUG FIREBASE WEBHOOK ===');
    
    // Test 1: Verificar variables de entorno
    const hasServiceAccountKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    console.log(`🔑 FIREBASE_SERVICE_ACCOUNT_KEY presente: ${hasServiceAccountKey}`);
    
    if (!hasServiceAccountKey) {
      return NextResponse.json({
        success: false,
        error: 'FIREBASE_SERVICE_ACCOUNT_KEY no configurada',
        hasServiceAccountKey: false
      });
    }
    
    // Test 2: Intentar importar Firebase
    try {
      console.log('🔄 Importando Firebase users module...');
      const { createFirebaseUser, getFirebaseUser } = await import('@/lib/firebase-users');
      console.log('✅ Firebase users module importado correctamente');
      
      // Test 3: Intentar crear un usuario de prueba
      const testPhoneNumber = '5219998887777';
      const testEmail = `${testPhoneNumber}@whatsapp.local`;
      
      console.log(`🔄 Verificando si usuario existe: ${testPhoneNumber}`);
      
      // Verificar si el usuario ya existe
      const existingUser = await getFirebaseUser(testPhoneNumber);
      if (existingUser) {
        console.log(`✅ Usuario ya existe: ${existingUser.uid}`);
        return NextResponse.json({
          success: true,
          message: 'Usuario ya existe en Firebase',
          user: {
            uid: existingUser.uid,
            email: existingUser.email,
            displayName: existingUser.displayName
          }
        });
      }
      
      // Crear nuevo usuario
      console.log(`🔄 Creando usuario: ${testEmail}`);
      const user = await createFirebaseUser(testEmail, testPhoneNumber, testPhoneNumber);
      console.log(`✅ Usuario creado exitosamente: ${user.uid}`);
      
      return NextResponse.json({
        success: true,
        message: 'Usuario creado exitosamente en Firebase',
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.metadata.creationTime
        }
      });
      
    } catch (firebaseError: any) {
      console.error('❌ Error con Firebase:', firebaseError.message);
      return NextResponse.json({
        success: false,
        error: 'Error con Firebase',
        details: firebaseError.message,
        stack: firebaseError.stack
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('❌ Error general:', error.message);
    return NextResponse.json({
      success: false,
      error: 'Error general',
      details: error.message
    }, { status: 500 });
  }
}
