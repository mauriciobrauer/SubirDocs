import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 === DIAGNÓSTICO FIREBASE ===');
    
    // 1. Verificar variables de entorno
    const hasServiceAccountKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const serviceAccountKeyLength = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0;
    
    console.log(`🔑 FIREBASE_SERVICE_ACCOUNT_KEY presente: ${hasServiceAccountKey}`);
    console.log(`📏 Longitud de la clave: ${serviceAccountKeyLength}`);
    
    // 2. Verificar otras variables de entorno
    const nodeEnv = process.env.NODE_ENV;
    const vercelEnv = process.env.VERCEL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    console.log(`🌍 NODE_ENV: ${nodeEnv}`);
    console.log(`☁️ VERCEL: ${vercelEnv}`);
    console.log(`🏗️ PROJECT_ID: ${projectId}`);
    
    // 3. Intentar parsear la clave de servicio
    let serviceAccountParsed = false;
    let serviceAccountError = null;
    
    if (hasServiceAccountKey) {
      try {
        const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
        serviceAccountParsed = true;
        console.log(`✅ Clave de servicio parseada correctamente`);
        console.log(`📧 Client email: ${parsed.client_email}`);
        console.log(`🏗️ Project ID: ${parsed.project_id}`);
        console.log(`🔑 Private key ID: ${parsed.private_key_id}`);
      } catch (error: any) {
        serviceAccountError = error.message;
        console.error(`❌ Error parseando clave de servicio: ${error.message}`);
      }
    }
    
    // 4. Intentar importar Firebase
    let firebaseImportSuccess = false;
    let firebaseImportError = null;
    
    try {
      const firebaseModule = await import('@/lib/firebase');
      firebaseImportSuccess = true;
      console.log(`✅ Firebase module importado correctamente`);
      console.log(`🔧 Auth disponible: ${!!firebaseModule.auth}`);
    } catch (error: any) {
      firebaseImportError = error.message;
      console.error(`❌ Error importando Firebase: ${error.message}`);
    }
    
    // 5. Intentar inicializar Firebase Auth
    let firebaseAuthSuccess = false;
    let firebaseAuthError = null;
    let userCount = 0;
    
    if (firebaseImportSuccess) {
      try {
        const { auth } = await import('@/lib/firebase');
        const listUsersResult = await auth.listUsers();
        firebaseAuthSuccess = true;
        userCount = listUsersResult.users.length;
        console.log(`✅ Firebase Auth funcionando correctamente`);
        console.log(`👥 Usuarios en Firebase: ${userCount}`);
      } catch (error: any) {
        firebaseAuthError = error.message;
        console.error(`❌ Error con Firebase Auth: ${error.message}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        hasServiceAccountKey,
        serviceAccountKeyLength,
        nodeEnv,
        vercelEnv,
        projectId
      },
      serviceAccount: {
        parsed: serviceAccountParsed,
        error: serviceAccountError
      },
      firebase: {
        importSuccess: firebaseImportSuccess,
        importError: firebaseImportError,
        authSuccess: firebaseAuthSuccess,
        authError: firebaseAuthError,
        userCount
      },
      summary: {
        ready: firebaseAuthSuccess,
        issues: [
          !hasServiceAccountKey && 'FIREBASE_SERVICE_ACCOUNT_KEY no configurada',
          !serviceAccountParsed && 'Error parseando clave de servicio',
          !firebaseImportSuccess && 'Error importando Firebase',
          !firebaseAuthSuccess && 'Error con Firebase Auth'
        ].filter(Boolean)
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error en diagnóstico Firebase:', error);
    return NextResponse.json({
      success: false,
      error: 'Error en diagnóstico Firebase',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
