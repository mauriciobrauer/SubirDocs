import { NextResponse } from 'next/server';
import { migrateSimulatedUsersToFirebase, getAllFirebaseUsers } from '@/lib/firebase-users';

export async function POST() {
  try {
    console.log('🔄 Iniciando migración de usuarios simulados a Firebase...');
    
    // Migrar usuarios simulados
    const migratedUsers = await migrateSimulatedUsersToFirebase();
    
    // Obtener todos los usuarios de Firebase después de la migración
    const allFirebaseUsers = await getAllFirebaseUsers();
    
    return NextResponse.json({
      success: true,
      message: 'Migración completada exitosamente',
      migratedCount: migratedUsers.length,
      totalFirebaseUsers: allFirebaseUsers.length,
      firebaseUsers: allFirebaseUsers.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        createdAt: user.metadata.creationTime
      }))
    });
    
  } catch (error: any) {
    console.error('❌ Error en migración a Firebase:', error);
    return NextResponse.json({
      success: false,
      error: 'Error en migración a Firebase',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('🔄 Obteniendo usuarios de Firebase...');
    
    const firebaseUsers = await getAllFirebaseUsers();
    
    return NextResponse.json({
      success: true,
      message: 'Usuarios de Firebase obtenidos exitosamente',
      count: firebaseUsers.length,
      users: firebaseUsers.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        createdAt: user.metadata.creationTime,
        lastSignIn: user.metadata.lastSignInTime
      }))
    });
    
  } catch (error: any) {
    console.error('❌ Error obteniendo usuarios de Firebase:', error);
    return NextResponse.json({
      success: false,
      error: 'Error obteniendo usuarios de Firebase',
      details: error.message
    }, { status: 500 });
  }
}
