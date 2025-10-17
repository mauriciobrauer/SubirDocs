import { NextRequest, NextResponse } from 'next/server';
import { DropboxAPI } from '@/lib/dropbox-api';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json({ 
        error: 'Email de usuario requerido' 
      }, { status: 400 });
    }

    console.log(`🧪 Probando eliminación de carpeta Dropbox para: ${userEmail}`);

    // Primero, verificar si la carpeta existe
    const folderExists = await DropboxAPI.userFolderExists(userEmail);
    console.log(`📁 Carpeta existe: ${folderExists}`);

    if (!folderExists) {
      return NextResponse.json({
        success: true,
        message: 'La carpeta no existe en Dropbox',
        userEmail,
        folderExists: false,
        action: 'none'
      });
    }

    // Obtener información de la carpeta antes de eliminar
    const folderInfo = await DropboxAPI.getUserFolderInfo(userEmail);
    console.log(`📊 Información de la carpeta:`, folderInfo);

    // Eliminar la carpeta
    const deleted = await DropboxAPI.deleteUserFolder(userEmail);
    console.log(`🗑️ Carpeta eliminada: ${deleted}`);

    return NextResponse.json({
      success: true,
      message: deleted ? 'Carpeta eliminada exitosamente' : 'No se pudo eliminar la carpeta',
      userEmail,
      folderExists: true,
      folderInfo,
      deleted,
      action: 'deleted'
    });

  } catch (error: any) {
    console.error('Error en test de eliminación de Dropbox:', error);
    return NextResponse.json({ 
      error: 'Error probando eliminación de Dropbox',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    if (!userEmail) {
      return NextResponse.json({ 
        error: 'Email de usuario requerido como parámetro userEmail' 
      }, { status: 400 });
    }

    console.log(`🔍 Verificando estado de carpeta Dropbox para: ${userEmail}`);

    // Verificar si la carpeta existe
    const folderExists = await DropboxAPI.userFolderExists(userEmail);
    
    if (!folderExists) {
      return NextResponse.json({
        success: true,
        message: 'La carpeta no existe en Dropbox',
        userEmail,
        folderExists: false
      });
    }

    // Obtener información detallada de la carpeta
    const folderInfo = await DropboxAPI.getUserFolderInfo(userEmail);

    return NextResponse.json({
      success: true,
      message: 'Información de carpeta obtenida exitosamente',
      userEmail,
      folderExists: true,
      folderInfo
    });

  } catch (error: any) {
    console.error('Error verificando carpeta de Dropbox:', error);
    return NextResponse.json({ 
      error: 'Error verificando carpeta de Dropbox',
      details: error.message
    }, { status: 500 });
  }
}
