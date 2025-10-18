import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { deleteUser as deleteUserFromMemory, getAllUsers } from '@/lib/users-production';
import { DropboxAPI } from '@/lib/dropbox-api';

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
      
      if (result.success && result.user) {
        // Eliminar carpeta de Dropbox
        let dropboxResult = { success: false, message: 'No se pudo eliminar carpeta de Dropbox' };
        
        try {
          console.log(`🗑️ Eliminando carpeta de Dropbox para: ${result.user.email}`);
          const dropboxDeleted = await DropboxAPI.deleteUserFolder(result.user.email);
          
          if (dropboxDeleted) {
            dropboxResult = { success: true, message: 'Carpeta de Dropbox eliminada exitosamente' };
            console.log(`✅ Carpeta de Dropbox eliminada para: ${result.user.email}`);
          }
        } catch (dropboxError: any) {
          console.error(`❌ Error eliminando carpeta de Dropbox:`, dropboxError.message);
          dropboxResult = { success: false, message: `Error eliminando carpeta de Dropbox: ${dropboxError.message}` };
        }
        
        return NextResponse.json({
          success: true,
          message: result.message,
          deletedUser: {
            id: result.user.id,
            email: result.user.email,
            phoneNumber: result.user.phoneNumber
          },
          dropboxDeletion: dropboxResult,
          warning: 'En producción, los cambios no se persisten. El usuario se recreará en el próximo reinicio del servidor.'
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
        console.log(`✅ Carpeta local eliminada: ${userFolder}`);
      } catch (deleteError) {
        console.error('❌ Error eliminando archivos locales del usuario:', deleteError);
        // No fallar la operación si no se pueden eliminar los archivos
        console.log('⚠️ Continuando sin eliminar archivos locales');
      }
    }

    // Eliminar carpeta de Dropbox
    console.log(`🗑️ === INICIANDO ELIMINACIÓN DE CARPETA DROPBOX DESDE DELETE-USER ===`);
    console.log(`📧 Email del usuario a eliminar: ${userToDelete.email}`);
    console.log(`📱 Número de teléfono: ${userToDelete.phoneNumber}`);
    
    let dropboxResult = { success: false, message: 'No se pudo eliminar carpeta de Dropbox' };
    
    try {
      console.log(`🗑️ Llamando a DropboxAPI.deleteUserFolder(${userToDelete.email})`);
      const dropboxDeleted = await DropboxAPI.deleteUserFolder(userToDelete.email);
      
      console.log(`📋 Resultado de deleteUserFolder: ${dropboxDeleted}`);
      
      if (dropboxDeleted) {
        dropboxResult = { success: true, message: 'Carpeta de Dropbox eliminada exitosamente' };
        console.log(`✅ Carpeta de Dropbox eliminada exitosamente para: ${userToDelete.email}`);
      } else {
        dropboxResult = { success: false, message: 'deleteUserFolder retornó false' };
        console.log(`❌ deleteUserFolder retornó false para: ${userToDelete.email}`);
      }
    } catch (dropboxError: any) {
      console.error(`❌ === ERROR EN ELIMINACIÓN DE CARPETA DROPBOX ===`);
      console.error(`❌ Error:`, dropboxError.message);
      console.error(`❌ Stack trace:`, dropboxError.stack);
      console.error(`❌ Error completo:`, JSON.stringify(dropboxError, null, 2));
      dropboxResult = { success: false, message: `Error eliminando carpeta de Dropbox: ${dropboxError.message}` };
    }

    console.log(`✅ Usuario eliminado: ${userToDelete.email}`);

    // Notificar via SSE para auto-refresh en tiempo real
    try {
      const { notifyUserDeleted } = await import('@/lib/sse-manager');
      notifyUserDeleted({
        id: userToDelete.id,
        email: userToDelete.email,
        phoneNumber: userToDelete.phoneNumber
      });
      console.log('📡 Notificación SSE de eliminación enviada para auto-refresh');
    } catch (sseError) {
      console.error('❌ Error enviando notificación SSE:', sseError);
    }

    return NextResponse.json({
      success: true,
      message: `Usuario ${userToDelete.email} eliminado exitosamente`,
      deletedUser: {
        id: userToDelete.id,
        email: userToDelete.email,
        phoneNumber: userToDelete.phoneNumber
      },
      dropboxDeletion: dropboxResult
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json({ 
      error: 'Error al eliminar usuario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
