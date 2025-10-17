import { Dropbox } from 'dropbox';
import { UploadedFile, DropboxFile, DropboxShareLink } from '@/types';

// Solo ejecutar en el servidor
const ACCESS_TOKEN = typeof window === 'undefined' ? process.env.DROPBOX_ACCESS_TOKEN : null;

if (!ACCESS_TOKEN && typeof window === 'undefined') {
  throw new Error('DROPBOX_ACCESS_TOKEN is required');
}

// Usar fetch global de Node.js 18+
const dbx = ACCESS_TOKEN ? new Dropbox({ 
  accessToken: ACCESS_TOKEN
}) : null;

export class DropboxService {
  static async ensureFolderExists(folder: string): Promise<void> {
    if (!dbx) return;
    
    try {
      // Intentar crear la carpeta (no falla si ya existe)
      await dbx.filesCreateFolderV2({
        path: folder,
        autorename: false
      });
    } catch (error: any) {
      // Si el error es que la carpeta ya existe, está bien
      if (error?.error?.error_summary?.includes('path/conflict/folder')) {
        // La carpeta ya existe, no hacer nada
        return;
      }
      // Si es otro error, lo propagamos
      throw error;
    }
  }

  static async uploadFile(file: File, folder: string = '/Prueva_dev'): Promise<UploadedFile> {
    if (!dbx) {
      throw new Error('Dropbox service not available on client side');
    }

    try {
      // Asegurar que la carpeta existe
      await this.ensureFolderExists(folder);
      
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${folder}/${fileName}`;
      
      // Convertir File a ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Subir archivo a Dropbox
      const uploadResponse = await dbx.filesUpload({
        path: filePath,
        contents: arrayBuffer,
        mode: 'add',
        autorename: true,
      });

      // Crear enlace compartido
      const shareResponse = await dbx.sharingCreateSharedLinkWithSettings({
        path: filePath,
        settings: {
          requested_visibility: 'public',
        },
      });

      // Obtener enlace de descarga directa
      const downloadResponse = await dbx.filesGetTemporaryLink({
        path: filePath,
      });

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
      console.error('Error uploading file to Dropbox:', error);
      throw new Error('Failed to upload file to Dropbox');
    }
  }

  static async getFiles(folder: string = '/Prueva_dev'): Promise<DropboxFile[]> {
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
          requested_visibility: 'public',
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
