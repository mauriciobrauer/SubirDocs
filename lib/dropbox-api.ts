import { UploadedFile, DropboxFile } from '@/types';

const ACCESS_TOKEN = typeof window === 'undefined' ? process.env.DROPBOX_ACCESS_TOKEN : null;

if (!ACCESS_TOKEN && typeof window === 'undefined') {
  throw new Error('DROPBOX_ACCESS_TOKEN is required');
}

export class DropboxAPI {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `https://api.dropboxapi.com/2${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dropbox API error: ${response.status} - ${error}`);
    }

    return response;
  }

  static async createFolder(path: string): Promise<void> {
    try {
      await this.makeRequest('/files/create_folder_v2', {
        method: 'POST',
        body: JSON.stringify({
          path,
          autorename: false
        })
      });
    } catch (error: any) {
      // Si el error es que la carpeta ya existe, está bien
      if (error.message.includes('path/conflict/folder')) {
        return;
      }
      throw error;
    }
  }

  static async uploadFile(file: File, userEmail: string = 'default'): Promise<UploadedFile> {
    // Crear estructura de carpetas: GuardaPDFDropbox/{usuario}
    const userFolder = `/GuardaPDFDropbox/${userEmail.replace('@', '_at_').replace('.', '_')}`;
    
    // Asegurar que la carpeta principal existe
    await this.createFolder('/GuardaPDFDropbox');
    // Asegurar que la carpeta del usuario existe
    await this.createFolder(userFolder);
    
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${userFolder}/${fileName}`;
    
    // Convertir File a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Subir archivo usando la API de Dropbox
    const uploadResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: filePath,
          mode: 'add',
          autorename: true
        }),
        'Content-Type': 'application/octet-stream',
      },
      body: arrayBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to Dropbox');
    }

    const uploadResult = await uploadResponse.json();
    
    // Crear enlace compartido
    const shareResponse = await this.makeRequest('/sharing/create_shared_link_with_settings', {
      method: 'POST',
      body: JSON.stringify({
        path: filePath,
        settings: {
          requested_visibility: 'public'
        }
      })
    });

    const shareResult = await shareResponse.json();
    
    // Obtener enlace de descarga temporal
    const downloadResponse = await this.makeRequest('/files/get_temporary_link', {
      method: 'POST',
      body: JSON.stringify({
        path: filePath
      })
    });

    const downloadResult = await downloadResponse.json();

    return {
      id: uploadResult.id,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      dropboxPath: filePath,
      shareUrl: shareResult.url,
      downloadUrl: downloadResult.link,
    };
  }

  static async getFiles(userEmail: string = 'default'): Promise<DropboxFile[]> {
    // Crear estructura de carpetas: GuardaPDFDropbox/{usuario}
    const userFolder = `/GuardaPDFDropbox/${userEmail.replace('@', '_at_').replace('.', '_')}`;
    
    // Asegurar que la carpeta principal existe
    await this.createFolder('/GuardaPDFDropbox');
    // Asegurar que la carpeta del usuario existe
    await this.createFolder(userFolder);
    
    const response = await this.makeRequest('/files/list_folder', {
      method: 'POST',
      body: JSON.stringify({
        path: userFolder,
        recursive: false
      })
    });

    const result = await response.json();
    
    return result.entries
      .filter((entry: any) => entry['.tag'] === 'file')
      .map((file: any) => ({
        name: file.name,
        path_lower: file.path_lower,
        size: file.size,
        client_modified: file.client_modified,
        server_modified: file.server_modified,
      }));
  }

  static async getShareLink(filePath: string): Promise<string> {
    const response = await this.makeRequest('/sharing/create_shared_link_with_settings', {
      method: 'POST',
      body: JSON.stringify({
        path: filePath,
        settings: {
          requested_visibility: 'public'
        }
      })
    });

    const result = await response.json();
    return result.url;
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
