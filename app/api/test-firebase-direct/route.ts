import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔥 === TEST FIREBASE DIRECTO ===');
    
    // Test 1: Verificar variables de entorno
    const hasServiceAccountKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    console.log(`🔑 FIREBASE_SERVICE_ACCOUNT_KEY presente: ${hasServiceAccountKey}`);
    
    // Test 2: Intentar importar Firebase
    try {
      const { createFirebaseUser, getFirebaseUser } = await import('@/lib/firebase-users');
      console.log('✅ Firebase users module importado correctamente');
      
      // Test 3: Intentar crear un usuario de prueba
      const testPhoneNumber = '5213334987878';
      const testEmail = `${testPhoneNumber}@whatsapp.local`;
      
      console.log(`🔄 Intentando crear usuario de prueba: ${testEmail}`);
      
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
      const newUser = await createFirebaseUser(testEmail, testPhoneNumber, testPhoneNumber);
      console.log(`✅ Usuario creado exitosamente: ${newUser.uid}`);
      
      return NextResponse.json({
        success: true,
        message: 'Usuario creado exitosamente en Firebase',
        user: {
          uid: newUser.uid,
          email: newUser.email,
          displayName: newUser.displayName,
          createdAt: newUser.metadata.creationTime
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
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
