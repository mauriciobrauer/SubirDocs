import { NextResponse } from 'next/server';
import { DropboxService } from '@/lib/dropbox';

export async function GET() {
  try {
    // Verificar si hay token de Dropbox configurado
    const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;
    if (!dropboxToken || dropboxToken === 'your_dropbox_token_here') {
      return NextResponse.json({ 
        error: 'Token de Dropbox no configurado',
        message: 'Configura DROPBOX_ACCESS_TOKEN en .env.local'
      }, { status: 400 });
    }

    // Obtener archivos de la carpeta whatsapp_files
    const files = await DropboxService.getFiles('whatsapp_files');
    
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
