import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🧪 === INICIANDO PRUEBA DE CREACIÓN DE USUARIO ===');
    
    // Verificar si estamos en producción
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    console.log(`🔍 Modo: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
    
    // Importar el sistema de memoria de producción
    const { addUser, getAllUsers, getUserByEmail } = await import('@/lib/users-production');
    
    // Verificar estado inicial
    const initialUsers = getAllUsers();
    console.log(`📊 Usuarios iniciales: ${initialUsers.length}`);
    
    // Crear un usuario de prueba
    const testPhoneNumber = '5213334987878';
    const testEmail = `${testPhoneNumber}@whatsapp.local`;
    
    console.log(`🔍 Verificando si usuario existe: ${testEmail}`);
    const existingUser = getUserByEmail(testEmail);
    
    if (existingUser) {
      console.log(`✅ Usuario ya existe: ${existingUser.email}`);
      return NextResponse.json({
        success: true,
        message: 'Usuario ya existe',
        user: existingUser,
        totalUsers: getAllUsers().length
      });
    }
    
    // Crear nuevo usuario
    const newUser = {
      id: `test_${Date.now()}`,
      email: testEmail,
      name: testPhoneNumber,
      password: 'test_password',
      phoneNumber: testPhoneNumber,
      createdAt: new Date().toISOString()
    };
    
    console.log(`➕ Agregando usuario: ${newUser.email}`);
    addUser(newUser);
    
    // Verificar que se agregó
    const finalUsers = getAllUsers();
    const addedUser = getUserByEmail(testEmail);
    
    console.log(`📊 Usuarios finales: ${finalUsers.length}`);
    console.log(`✅ Usuario agregado correctamente: ${!!addedUser}`);
    
    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: newUser,
      addedUser: addedUser,
      totalUsers: finalUsers.length,
      initialCount: initialUsers.length,
      finalCount: finalUsers.length
    });
    
  } catch (error: any) {
    console.error('❌ Error en prueba de creación de usuario:', error);
    return NextResponse.json({
      success: false,
      error: 'Error en prueba de creación de usuario',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
