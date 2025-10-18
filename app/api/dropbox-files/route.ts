import { NextResponse } from 'next/server';
import { DropboxAPI } from '@/lib/dropbox-api';

export async function GET() {
  try {
    // Verificar configuración de Dropbox
    const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
    const appKey = process.env.DROPBOX_APP_KEY;
    const appSecret = process.env.DROPBOX_APP_SECRET;
    
    if (!refreshToken || !appKey || !appSecret) {
      return NextResponse.json({ 
        error: 'Configuración de Dropbox incompleta',
        message: 'Configura DROPBOX_REFRESH_TOKEN, DROPBOX_APP_KEY y DROPBOX_APP_SECRET en .env.local'
      }, { status: 400 });
    }

    // Obtener archivos de la carpeta principal de Dropbox
    const files = await DropboxAPI.getAllFiles();
    
    // Transformar los datos para que coincidan con el formato esperado
    const transformedFiles = files.map(file => ({
      phoneNumber: file.path_lower.split('/')[1] || 'unknown', // Extraer número de teléfono de la ruta
      fileName: file.name,
      filePath: file.path_lower,
      size: file.size,
      createdAt: file.client_modified,
      modifiedAt: file.server_modified,
      extension: file.name.split('.').pop() || '',
      dropboxUrl: null // Se generará cuando sea necesario
    }));

    return NextResponse.json(transformedFiles);

  } catch (error) {
    console.error('Error obteniendo archivos de Dropbox:', error);
    return NextResponse.json({ 
      error: 'Error al obtener archivos de Dropbox',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
