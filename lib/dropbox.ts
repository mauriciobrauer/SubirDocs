import { Dropbox } from 'dropbox';
import { UploadedFile, DropboxFile, DropboxShareLink } from '@/types';

// Solo ejecutar en el servidor
const ACCESS_TOKEN = typeof window === 'undefined' ? process.env.DROPBOX_ACCESS_TOKEN : null;

console.log('🔑 Dropbox token check:', {
  hasToken: !!ACCESS_TOKEN,
  tokenStart: ACCESS_TOKEN ? ACCESS_TOKEN.substring(0, 10) + '...' : 'NO TOKEN',
  envVar: process.env.DROPBOX_ACCESS_TOKEN ? 'SET' : 'NOT SET',
  envVarStart: process.env.DROPBOX_ACCESS_TOKEN ? process.env.DROPBOX_ACCESS_TOKEN.substring(0, 10) + '...' : 'NO ENV VAR',
  isServer: typeof window === 'undefined',
  nodeEnv: process.env.NODE_ENV
});

if (!ACCESS_TOKEN && typeof window === 'undefined') {
  throw new Error('DROPBOX_ACCESS_TOKEN is required');
}

// Configurar fetch para Node.js
const fetch = globalThis.fetch || require('node-fetch');

// Usar fetch configurado para Node.js
const dbx = ACCESS_TOKEN ? new Dropbox({ 
  accessToken: ACCESS_TOKEN,
  fetch: fetch
}) : null;

export class DropboxService {
  static async ensureFolderExists(folder: string, token?: string): Promise<void> {
    // Usar token pasado como parámetro o el global
    const accessToken = token || ACCESS_TOKEN;
    
    console.log('🔍 === INICIANDO ensureFolderExists ===');
    console.log('📁 Carpeta solicitada:', folder);
    console.log('🔑 Token pasado como parámetro:', !!token);
    console.log('🔑 ACCESS_TOKEN disponible:', !!ACCESS_TOKEN);
    console.log('🔑 Token final a usar:', !!accessToken);
    console.log('🔑 Token inicio:', accessToken ? accessToken.substring(0, 15) + '...' : 'NO TOKEN');
    
    if (!accessToken) {
      console.log('❌ No hay token disponible para Dropbox');
      throw new Error('DROPBOX_ACCESS_TOKEN is required');
    }
    
    // Crear cliente Dropbox con el token específico
    const fetch = globalThis.fetch || require('node-fetch');
    const dbx = new Dropbox({ 
      accessToken: accessToken,
      fetch: fetch
    });
    
    console.log('✅ Cliente Dropbox creado con token específico');
    console.log('📁 Intentando crear carpeta:', folder);
    
    try {
      // Intentar crear la carpeta (no falla si ya existe)
      console.log('🚀 Haciendo llamada a filesCreateFolderV2...');
      console.log('📁 Ruta exacta:', folder);
      console.log('🔑 Token usado:', accessToken.substring(0, 20) + '...');
      
      const result = await dbx.filesCreateFolderV2({
        path: folder,
        autorename: false
      });
      console.log('✅ Carpeta creada exitosamente:', result.result);
    } catch (error: any) {
      console.log('❌ Error creando carpeta:', error.message);
      console.log('📋 Error status:', error.status);
      console.log('📋 Error headers:', error.headers ? Object.fromEntries(error.headers.entries()) : 'No headers');
      console.log('📋 Error details:', JSON.stringify(error.error, null, 2));
      console.log('📋 Error completo:', error);
      
      // Enviar log del error a la UI
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dropbox-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `❌ ERROR en ensureFolderExists: ${error.message} - Ruta: ${folder} - Status: ${error.status}`,
            phoneNumber: 'system',
            fileName: folder,
            error: {
              message: error.message,
              status: error.status,
              details: JSON.stringify(error.error, null, 2),
              headers: error.headers ? Object.fromEntries(error.headers.entries()) : 'No headers'
            }
          })
        });
      } catch (logError) {
        console.error('❌ Error enviando log de error:', logError);
      }
      
      // Si el error es que la carpeta ya existe, está bien
      if (error?.error?.error_summary?.includes('path/conflict/folder')) {
        console.log('✅ Carpeta ya existe, continuando...');
        return;
      }
      // Si es otro error, lo propagamos
      throw error;
    }
  }

  static async uploadFile(file: File, folder: string = '/GuardaPDFDropbox', token?: string): Promise<UploadedFile> {
    // Usar token pasado como parámetro o el global
    const accessToken = token || ACCESS_TOKEN;
    
    console.log('🔍 === INICIANDO DropboxService.uploadFile ===');
    console.log('📁 Carpeta:', folder);
    console.log('📄 Archivo:', file.name, 'Tamaño:', file.size);
    console.log('🔑 Token disponible:', !!accessToken);
    
    // Enviar log a la UI
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dropbox-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `🔍 INICIANDO DropboxService.uploadFile - Carpeta: ${folder}, Archivo: ${file.name}`,
          phoneNumber: 'system',
          fileName: file.name
        })
      });
    } catch (logError) {
      console.error('❌ Error enviando log de inicio:', logError);
    }
    
    if (!accessToken) {
      throw new Error('DROPBOX_ACCESS_TOKEN is required');
    }
    
    // Crear cliente Dropbox con el token específico
    const fetch = globalThis.fetch || require('node-fetch');
    const dbx = new Dropbox({ 
      accessToken: accessToken,
      fetch: fetch
    });

    try {
      console.log('📂 PASO 1: Asegurando que la carpeta existe...');
      // Asegurar que la carpeta existe
      await this.ensureFolderExists(folder, accessToken);
      console.log('✅ PASO 1: Carpeta verificada/creada');
      
      // Enviar log del paso 1
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dropbox-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `✅ PASO 1: Carpeta verificada/creada - ${folder}`,
            phoneNumber: 'system',
            fileName: file.name
          })
        });
      } catch (logError) {
        console.error('❌ Error enviando log del paso 1:', logError);
      }
      
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${folder}/${fileName}`;
      console.log('📄 Archivo final:', fileName);
      console.log('📁 Ruta completa:', filePath);
      
      console.log('🔄 PASO 2: Convirtiendo File a ArrayBuffer...');
      // Convertir File a ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      console.log('✅ PASO 2: ArrayBuffer creado, tamaño:', arrayBuffer.byteLength);
      
      console.log('⬆️ PASO 3: Subiendo archivo a Dropbox...');
      // Subir archivo a Dropbox
      const uploadResponse = await dbx.filesUpload({
        path: filePath,
        contents: arrayBuffer,
        mode: { '.tag': 'add' },
        autorename: true,
      });
      console.log('✅ PASO 3: Archivo subido exitosamente:', uploadResponse.result.id);

      console.log('🔗 PASO 4: Creando enlace compartido...');
      // Crear enlace compartido
      const shareResponse = await dbx.sharingCreateSharedLinkWithSettings({
        path: filePath,
        settings: {
          requested_visibility: { '.tag': 'public' },
        },
      });
      console.log('✅ PASO 4: Enlace compartido creado:', shareResponse.result.url);

      console.log('🔗 PASO 5: Obteniendo enlace temporal...');
      // Obtener enlace de descarga directa
      const downloadResponse = await dbx.filesGetTemporaryLink({
        path: filePath,
      });
      console.log('✅ PASO 5: Enlace temporal obtenido:', downloadResponse.result.link);

      console.log('🎉 === UPLOAD COMPLETADO EXITOSAMENTE ===');
      return {
        id: uploadResponse.result.id,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        dropboxPath: filePath,
        shareUrl: shareResponse.result.url,
        downloadUrl: downloadResponse.result.link,
      };
    } catch (error) {
      console.error('❌ === ERROR EN DropboxService.uploadFile ===');
      console.error('❌ Error completo:', error);
      console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
      
      // Si es un error de Dropbox, mostrar más detalles
      if (error && typeof error === 'object' && 'status' in error) {
        console.error('❌ Dropbox error status:', (error as any).status);
        console.error('❌ Dropbox error details:', (error as any).error);
      }
      
      // Enviar log del error a la UI
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dropbox-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `❌ ERROR EN DropboxService.uploadFile: ${error instanceof Error ? error.message : String(error)}`,
            phoneNumber: 'system',
            fileName: file.name,
            error: {
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : 'No stack',
              type: error instanceof Error ? error.constructor.name : typeof error
            }
          })
        });
      } catch (logError) {
        console.error('❌ Error enviando log de error:', logError);
      }
      
      throw new Error('Failed to upload file to Dropbox');
    }
  }

  static async getFiles(folder: string = '/GuardaPDFDropbox'): Promise<DropboxFile[]> {
    if (!dbx) {
      throw new Error('Dropbox service not available on client side');
    }

    try {
      // Asegurar que la carpeta existe
      await this.ensureFolderExists(folder);
      
      const response = await dbx.filesListFolder({
        path: folder,
      });

      return response.result.entries
        .filter((entry: any) => entry['.tag'] === 'file')
        .map((file: any) => ({
          name: file.name,
          path_lower: file.path_lower,
          size: file.size,
          client_modified: file.client_modified,
          server_modified: file.server_modified,
        }));
    } catch (error) {
      console.error('Error fetching files from Dropbox:', error);
      throw new Error('Failed to fetch files from Dropbox');
    }
  }

  static async getShareLink(filePath: string): Promise<string> {
    if (!dbx) {
      throw new Error('Dropbox service not available on client side');
    }

    try {
      const response = await dbx.sharingCreateSharedLinkWithSettings({
        path: filePath,
        settings: {
          requested_visibility: { '.tag': 'public' },
        },
      });

      return response.result.url;
    } catch (error) {
      console.error('Error creating share link:', error);
      throw new Error('Failed to create share link');
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    if (!dbx) {
      throw new Error('Dropbox service not available on client side');
    }

    try {
      await dbx.filesDeleteV2({
        path: filePath,
      });
    } catch (error) {
      console.error('Error deleting file from Dropbox:', error);
      throw new Error('Failed to delete file from Dropbox');
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      default:
        return '📁';
    }
  }
}
