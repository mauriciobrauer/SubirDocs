import { NextResponse } from 'next/server';

export async function GET() {
  const debugLogs: string[] = [];
  
  try {
    debugLogs.push('🔥 === DIAGNÓSTICO FIREBASE EN /api/users ===');
    debugLogs.push(`🔑 FIREBASE_SERVICE_ACCOUNT_KEY presente: ${!!process.env.FIREBASE_SERVICE_ACCOUNT_KEY}`);
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        debugLogs.push(`✅ FIREBASE_SERVICE_ACCOUNT_KEY es JSON válido`);
        debugLogs.push(`📧 Client Email: ${serviceAccount.client_email}`);
        debugLogs.push(`🆔 Project ID: ${serviceAccount.project_id}`);
      } catch (e) {
        debugLogs.push(`❌ FIREBASE_SERVICE_ACCOUNT_KEY no es JSON válido: ${e}`);
      }
    }
    
    // Intentar usar Firebase primero (si está disponible)
    try {
      debugLogs.push('🔄 Importando Firebase users module...');
      const { getAllFirebaseUsers } = await import('@/lib/firebase-users');
      debugLogs.push('✅ Firebase users module importado correctamente');
      
      debugLogs.push('🔄 Obteniendo usuarios de Firebase...');
      const firebaseUsers = await getAllFirebaseUsers();
      debugLogs.push(`✅ Usuarios obtenidos desde Firebase: ${firebaseUsers.length} usuarios`);
      
      // Transformar usuarios de Firebase al formato esperado
      const users = firebaseUsers.map(user => ({
        id: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        phoneNumber: user.phoneNumber?.replace('+', '') || user.uid,
        createdAt: user.metadata.creationTime
      }));
      
      return NextResponse.json({
        success: true,
        users,
        count: users.length,
        source: 'Firebase',
        firebaseWorking: true,
        hasServiceAccountKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        serviceAccountKeyLength: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? process.env.FIREBASE_SERVICE_ACCOUNT_KEY.length : 0,
        debugLogs: debugLogs
      });
      
    } catch (firebaseError) {
      debugLogs.push('❌ === ERROR EN FIREBASE ===');
      debugLogs.push(`❌ Firebase no disponible, usando sistema local`);
      debugLogs.push(`❌ Error Firebase: ${firebaseError instanceof Error ? firebaseError.message : String(firebaseError)}`);
      if (firebaseError instanceof Error) {
        debugLogs.push(`❌ Stack trace: ${firebaseError.stack}`);
      }
      
      // Devolver información detallada del error
      return NextResponse.json({
        success: false,
        error: 'Firebase no disponible',
        firebaseError: firebaseError instanceof Error ? firebaseError.message : String(firebaseError),
        firebaseStack: firebaseError instanceof Error ? firebaseError.stack : undefined,
        hasServiceAccountKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        serviceAccountKeyLength: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? process.env.FIREBASE_SERVICE_ACCOUNT_KEY.length : 0,
        debugLogs: debugLogs
      }, { status: 500 });
      
      // Fallback al sistema anterior si Firebase no está disponible
      const { getAllUsers } = await import('@/lib/users-production');
      const users = getAllUsers();
      
      console.log(`✅ Usuarios obtenidos desde sistema local: ${users.length} usuarios`);
      
      return NextResponse.json({
        success: true,
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt
        })),
        count: users.length,
        source: 'Local Memory',
        firebaseWorking: false,
        firebaseError: firebaseError instanceof Error ? firebaseError.message : String(firebaseError),
        firebaseStack: firebaseError instanceof Error ? firebaseError.stack : undefined,
        hasServiceAccountKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      });
    }

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json({ 
      error: 'Error al obtener usuarios',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
