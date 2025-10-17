import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'ID de usuario requerido' 
      }, { status: 400 });
    }

    // Leer usuarios desde archivo JSON
    const usersFile = path.join(process.cwd(), 'users.json');
    let users: Array<{
      id: string;
      email: string;
      name: string;
      password: string;
      phoneNumber?: string;
      createdAt: string;
    }> = [];

    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf-8');
      users = JSON.parse(data);
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

    // Guardar usuarios actualizados
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    // Eliminar archivos locales del usuario
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
