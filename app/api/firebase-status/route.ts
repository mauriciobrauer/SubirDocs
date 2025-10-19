import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const logs: string[] = [];
    
    logs.push('🔥 === DIAGNÓSTICO FIREBASE ===');
    logs.push(`🔑 FIREBASE_SERVICE_ACCOUNT_KEY presente: ${!!process.env.FIREBASE_SERVICE_ACCOUNT_KEY}`);
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        logs.push(`✅ FIREBASE_SERVICE_ACCOUNT_KEY es JSON válido`);
        logs.push(`📧 Client Email: ${serviceAccount.client_email}`);
        logs.push(`🆔 Project ID: ${serviceAccount.project_id}`);
      } catch (e) {
        logs.push(`❌ FIREBASE_SERVICE_ACCOUNT_KEY no es JSON válido: ${e}`);
      }
    }
    
    // Test Firebase
    try {
      logs.push('🔄 Importando Firebase users module...');
      const { getAllFirebaseUsers, createFirebaseUser, getFirebaseUser } = await import('@/lib/firebase-users');
      logs.push('✅ Firebase users module importado correctamente');
      
      logs.push('🔄 Obteniendo usuarios de Firebase...');
      const firebaseUsers = await getAllFirebaseUsers();
      logs.push(`✅ Usuarios obtenidos desde Firebase: ${firebaseUsers.length} usuarios`);
      
      // Test crear usuario
      const testPhoneNumber = '5219998887777';
      const testEmail = `${testPhoneNumber}@whatsapp.local`;
      
      logs.push('🔄 === TEST: CREANDO USUARIO DE PRUEBA ===');
      try {
        const existingTestUser = await getFirebaseUser(testPhoneNumber);
        if (existingTestUser) {
          logs.push(`✅ Usuario de prueba ya existe: ${existingTestUser.email}`);
        } else {
          const newTestUser = await createFirebaseUser(testEmail, testPhoneNumber, testPhoneNumber);
          logs.push(`✅ Usuario de prueba creado: ${newTestUser.uid}`);
        }
      } catch (testError: any) {
        logs.push(`❌ Error en test de creación de usuario: ${testError.message}`);
        logs.push(`📋 Stack: ${testError.stack}`);
      }
      
      return NextResponse.json({
        success: true,
        firebaseWorking: true,
        userCount: firebaseUsers.length,
        logs: logs
      });
      
    } catch (firebaseError: any) {
      logs.push(`❌ Error con Firebase: ${firebaseError.message}`);
      logs.push(`📋 Stack: ${firebaseError.stack}`);
      
      return NextResponse.json({
        success: false,
        firebaseWorking: false,
        error: firebaseError.message,
        logs: logs
      });
    }
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      logs: [`❌ Error general: ${error.message}`]
    }, { status: 500 });
  }
}
