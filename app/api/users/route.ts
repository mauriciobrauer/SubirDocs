import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Intentar usar Firebase primero (si está disponible)
    try {
      const { getAllFirebaseUsers } = await import('@/lib/firebase-users');
      
      const firebaseUsers = await getAllFirebaseUsers();
      console.log(`✅ Usuarios obtenidos desde Firebase: ${firebaseUsers.length} usuarios`);
      
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
        source: 'Firebase'
      });
      
    } catch (firebaseError) {
      console.log('⚠️ Firebase no disponible, usando sistema local');
      console.log(`⚠️ Error Firebase: ${firebaseError instanceof Error ? firebaseError.message : String(firebaseError)}`);
      
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
        source: 'Local Memory'
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
