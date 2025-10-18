import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 CREANDO USUARIO DE PRUEBA');
    
    // Crear un usuario de prueba
    const phoneNumber = '5213334987878';
    const email = `${phoneNumber}@whatsapp.local`;
    const userId = `user_${Date.now()}`;
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUser = {
      id: userId,
      email,
      name: phoneNumber,
      password: hashedPassword,
      phoneNumber: phoneNumber,
      createdAt: new Date().toISOString()
    };

    console.log('✅ Usuario de prueba creado:', {
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
      phoneNumber: testUser.phoneNumber
    });

    // En producción, agregar al sistema de memoria
    try {
      const { addUser } = await import('@/lib/users-production');
      addUser(testUser);
      console.log('✅ Usuario agregado al sistema de memoria en producción');
    } catch (memoryError) {
      console.error('❌ Error agregando usuario a memoria en producción:', memoryError);
    }

    // Notificar que se creó un usuario
    try {
      const { notifyUserCreated } = await import('@/lib/sse-manager');
      notifyUserCreated({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        phoneNumber: testUser.phoneNumber,
        createdAt: testUser.createdAt
      });
      console.log('📡 Notificación SSE de creación enviada');
    } catch (sseError) {
      console.error('❌ Error enviando notificación SSE:', sseError);
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario de prueba creado exitosamente',
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        phoneNumber: testUser.phoneNumber,
        createdAt: testUser.createdAt
      }
    });

  } catch (error: any) {
    console.error('❌ Error creando usuario de prueba:', error);
    return NextResponse.json({
      success: false,
      error: 'Error creando usuario de prueba',
      errorDetails: error.message
    }, { status: 500 });
  }
}
