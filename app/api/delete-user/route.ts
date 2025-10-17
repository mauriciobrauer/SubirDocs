import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { deleteUser as deleteUserFromMemory, getAllUsers } from '@/lib/users-production';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'ID de usuario requerido' 
      }, { status: 400 });
    }

    // Verificar si estamos en producción (Vercel)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    if (isProduction) {
      // En producción, usar el sistema de memoria
      console.log(`⚠️ Modo producción: Eliminación de usuario ${userId} solo en memoria`);
      
      const result = deleteUserFromMemory(userId);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message,
          deletedUser: {
            id: result.user?.id,
            email: result.user?.email,
            phoneNumber: result.user?.phoneNumber
          },
          warning: 'En producción, los cambios no se persisten. El usuario se recreará en el próximo reinicio.'
        });
      } else {
        return NextResponse.json({ 
          error: result.message 
        }, { status: 404 });
      }
    }

    // Leer usuarios desde archivo JSON (solo en desarrollo)
    const usersFile = path.join(process.cwd(), 'users.json');
    let users: Array<{
      id: string;
      email: string;
      name: string;
      password: string;
      phoneNumber?: string;
      createdAt: string;
    }> = [];

    try {
      if (fs.existsSync(usersFile)) {
        const data = fs.readFileSync(usersFile, 'utf-8');
        users = JSON.parse(data);
      }
    } catch (readError) {
      console.error('Error leyendo archivo de usuarios:', readError);
      return NextResponse.json({ 
        error: 'Error al leer la lista de usuarios',
        details: readError instanceof Error ? readError.message : 'Error desconocido'
      }, { status: 500 });
    }

    // Buscar el usuario a eliminar
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado' 
      }, { status: 404 });
    }

    const userToDelete = users[userIndex];
    
    // Solo permitir eliminar usuarios auto-creados (que tienen phoneNumber)
    if (!userToDelete.phoneNumber) {
      return NextResponse.json({ 
        error: 'Solo se pueden eliminar usuarios auto-creados' 
      }, { status: 403 });
    }

    // Eliminar el usuario del array
    users.splice(userIndex, 1);

    // Guardar usuarios actualizados (solo en desarrollo)
    try {
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      console.log(`✅ Archivo de usuarios actualizado: ${usersFile}`);
    } catch (writeError) {
      console.error('Error escribiendo archivo de usuarios:', writeError);
      return NextResponse.json({ 
        error: 'Error al guardar los cambios',
        details: writeError instanceof Error ? writeError.message : 'Error desconocido'
      }, { status: 500 });
    }

    // Eliminar archivos locales del usuario (solo en desarrollo)
    const phoneNumber = userToDelete.phoneNumber;
    const userFolder = path.join(process.cwd(), 'tmp-files', phoneNumber);
    
    if (fs.existsSync(userFolder)) {
      try {
        // Eliminar todos los archivos en la carpeta
        const files = fs.readdirSync(userFolder);
        files.forEach(file => {
          const filePath = path.join(userFolder, file);
          fs.unlinkSync(filePath);
        });
        
        // Eliminar la carpeta
        fs.rmdirSync(userFolder);
        console.log(`✅ Carpeta eliminada: ${userFolder}`);
      } catch (deleteError) {
        console.error('❌ Error eliminando archivos del usuario:', deleteError);
        // No fallar la operación si no se pueden eliminar los archivos
        console.log('⚠️ Continuando sin eliminar archivos locales');
      }
    }

    console.log(`✅ Usuario eliminado: ${userToDelete.email}`);

    return NextResponse.json({
      success: true,
      message: `Usuario ${userToDelete.email} eliminado exitosamente`,
      deletedUser: {
        id: userToDelete.id,
        email: userToDelete.email,
        phoneNumber: userToDelete.phoneNumber
      }
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json({ 
      error: 'Error al eliminar usuario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
