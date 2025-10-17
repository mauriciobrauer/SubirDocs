import { NextRequest, NextResponse } from 'next/server';

// Cache temporal en memoria para usuarios en producción
let productionUsers: Array<{
  id: string;
  email: string;
  name: string;
  password: string;
  phoneNumber?: string;
  createdAt: string;
}> = [];

// Usuarios hardcodeados que nunca se eliminan
const HARDCODED_USERS = [
  { id: '1', email: 'maria.garcia@empresa.com', name: 'María García', phoneNumber: 'N/A', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '2', email: 'carlos.rodriguez@empresa.com', name: 'Carlos Rodríguez', phoneNumber: 'N/A', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '3', email: 'ana.martinez@empresa.com', name: 'Ana Martínez', phoneNumber: 'N/A', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '4', email: 'david.lopez@empresa.com', name: 'David López', phoneNumber: 'N/A', createdAt: '2025-01-01T00:00:00.000Z' },
];

// Inicializar con el usuario que queremos eliminar
if (productionUsers.length === 0) {
  productionUsers = [
    {
      id: 'user_1760719402064',
      email: '5213334987878@whatsapp.local',
      name: '5213334987878',
      password: '$2b$10$uJBkQMBPFqTfsKZUElf8QOJFdrE4.1cXcf8sDkA6rj/cZX5i/27Si',
      phoneNumber: '5213334987878',
      createdAt: '2025-10-17T16:43:22.200Z'
    }
  ];
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'ID de usuario requerido' 
      }, { status: 400 });
    }

    console.log(`🔍 Intentando eliminar usuario: ${userId}`);
    console.log(`📋 Usuarios en memoria: ${productionUsers.length}`);

    // Buscar el usuario a eliminar
    const userIndex = productionUsers.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      console.log(`❌ Usuario ${userId} no encontrado en memoria`);
      return NextResponse.json({ 
        error: 'Usuario no encontrado' 
      }, { status: 404 });
    }

    const userToDelete = productionUsers[userIndex];
    
    // Solo permitir eliminar usuarios auto-creados (que tienen phoneNumber)
    if (!userToDelete.phoneNumber) {
      return NextResponse.json({ 
        error: 'Solo se pueden eliminar usuarios auto-creados' 
      }, { status: 403 });
    }

    // Eliminar el usuario del array en memoria
    productionUsers.splice(userIndex, 1);
    
    console.log(`✅ Usuario eliminado de memoria: ${userToDelete.email}`);
    console.log(`📋 Usuarios restantes en memoria: ${productionUsers.length}`);

    return NextResponse.json({
      success: true,
      message: `Usuario ${userToDelete.email} eliminado exitosamente de la memoria`,
      deletedUser: {
        id: userToDelete.id,
        email: userToDelete.email,
        phoneNumber: userToDelete.phoneNumber
      },
      warning: 'Usuario eliminado solo de la memoria. Se recreará en el próximo reinicio del servidor.'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json({ 
      error: 'Error al eliminar usuario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Combinar usuarios hardcodeados con usuarios en memoria
    const allUsers = [
      ...HARDCODED_USERS.map(user => ({ ...user, type: 'hardcoded' })),
      ...productionUsers.map(user => ({ ...user, type: 'auto-created' }))
    ];
    
    return NextResponse.json({
      success: true,
      users: allUsers,
      hardcodedCount: HARDCODED_USERS.length,
      autoCreatedCount: productionUsers.length,
      totalCount: allUsers.length,
      environment: 'production-memory'
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json({ 
      error: 'Error al obtener usuarios',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
