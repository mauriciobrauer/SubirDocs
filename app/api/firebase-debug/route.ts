import { NextResponse } from 'next/server';

export async function GET() {
  const logs: string[] = [];
  
  try {
    logs.push('🔥 === INICIANDO DIAGNÓSTICO FIREBASE ===');
    logs.push(`🔑 FIREBASE_SERVICE_ACCOUNT_KEY presente: ${!!process.env.FIREBASE_SERVICE_ACCOUNT_KEY}`);
    logs.push(`📏 Longitud de FIREBASE_SERVICE_ACCOUNT_KEY: ${process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? process.env.FIREBASE_SERVICE_ACCOUNT_KEY.length : 0}`);
    
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
    
    // Test 1: Intentar importar Firebase
    logs.push('🔄 === TEST 1: IMPORTANDO FIREBASE ===');
    try {
      const { auth } = await import('@/lib/firebase');
      logs.push('✅ Firebase auth importado correctamente');
      logs.push(`🔧 Auth disponible: ${!!auth}`);
    } catch (error: any) {
      logs.push(`❌ Error importando Firebase: ${error.message}`);
      logs.push(`📋 Stack: ${error.stack}`);
    }
    
    // Test 2: Intentar importar Firebase users
    logs.push('🔄 === TEST 2: IMPORTANDO FIREBASE USERS ===');
    try {
      const { createFirebaseUser, getFirebaseUser, getAllFirebaseUsers } = await import('@/lib/firebase-users');
      logs.push('✅ Firebase users module importado correctamente');
      
      // Test 3: Intentar obtener usuarios
      logs.push('🔄 === TEST 3: OBTENIENDO USUARIOS DE FIREBASE ===');
      try {
        const users = await getAllFirebaseUsers();
        logs.push(`✅ Usuarios obtenidos de Firebase: ${users.length} usuarios`);
        users.forEach((user, index) => {
          logs.push(`👤 Usuario ${index + 1}: ${user.email} (${user.uid})`);
        });
      } catch (error: any) {
        logs.push(`❌ Error obteniendo usuarios de Firebase: ${error.message}`);
        logs.push(`📋 Stack: ${error.stack}`);
      }
      
      // Test 4: Intentar crear un usuario de prueba
      logs.push('🔄 === TEST 4: CREANDO USUARIO DE PRUEBA ===');
      const testPhoneNumber = '5219998887777';
      const testEmail = `${testPhoneNumber}@whatsapp.local`;
      
      try {
        // Verificar si ya existe
        const existingUser = await getFirebaseUser(testPhoneNumber);
        if (existingUser) {
          logs.push(`✅ Usuario de prueba ya existe: ${existingUser.email}`);
        } else {
          // Crear nuevo usuario
          const newUser = await createFirebaseUser(testEmail, testPhoneNumber, testPhoneNumber);
          logs.push(`✅ Usuario de prueba creado: ${newUser.uid}`);
          logs.push(`📧 Email: ${newUser.email}`);
          logs.push(`📱 Phone: ${newUser.displayName}`);
        }
      } catch (error: any) {
        logs.push(`❌ Error creando usuario de prueba: ${error.message}`);
        logs.push(`📋 Stack: ${error.stack}`);
      }
      
    } catch (error: any) {
      logs.push(`❌ Error importando Firebase users: ${error.message}`);
      logs.push(`📋 Stack: ${error.stack}`);
    }
    
    logs.push('✅ === DIAGNÓSTICO COMPLETADO ===');
    
    return NextResponse.json({
      success: true,
      logs: logs,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL ? 'true' : 'false'
    });
    
  } catch (error: any) {
    logs.push(`❌ ERROR GENERAL: ${error.message}`);
    logs.push(`📋 Stack: ${error.stack}`);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      logs: logs,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
