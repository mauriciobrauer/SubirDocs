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
    try {
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
    } catch (error: any) {
      // Si el enlace ya existe, intentar obtenerlo
      if (error.message.includes('shared_link_already_exists')) {
        try {
          const listResponse = await this.makeRequest('/sharing/list_shared_links', {
            method: 'POST',
            body: JSON.stringify({
              path: filePath,
              direct_only: true
            })
          });

          const listResult = await listResponse.json();
          if (listResult.links && listResult.links.length > 0) {
            return listResult.links[0].url;
          }
        } catch (listError) {
          console.error('Error listing shared links:', listError);
        }
      }
      throw error;
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

  /**
   * Elimina una carpeta completa y todos sus archivos de Dropbox
   * @param userEmail - Email del usuario para generar la ruta de la carpeta
   * @returns Promise<boolean> - true si se eliminó exitosamente
   */
  static async deleteUserFolder(userEmail: string): Promise<boolean> {
    try {
      // Generar la ruta de la carpeta del usuario
      const userFolder = `/GuardaPDFDropbox/${userEmail.replace('@', '_at_').replace('.', '_')}`;
      
      console.log(`🗑️ Intentando eliminar carpeta de Dropbox: ${userFolder}`);
      
      // Primero, listar todos los archivos en la carpeta para eliminarlos
      try {
        const listResponse = await this.makeRequest('/files/list_folder', {
          method: 'POST',
          body: JSON.stringify({
            path: userFolder,
            recursive: true
          })
        });

        const listResult = await listResponse.json();
        const files = listResult.entries.filter((entry: any) => entry['.tag'] === 'file');
        
        console.log(`📋 Encontrados ${files.length} archivos para eliminar`);
        
        // Eliminar cada archivo individualmente
        for (const file of files) {
          try {
            await this.makeRequest('/files/delete_v2', {
              method: 'POST',
              body: JSON.stringify({
                path: file.path_lower
              })
            });
            console.log(`✅ Archivo eliminado: ${file.name}`);
          } catch (fileError: any) {
            console.error(`❌ Error eliminando archivo ${file.name}:`, fileError.message);
            // Continuar con los demás archivos
          }
        }
      } catch (listError: any) {
        // Si no se puede listar la carpeta, puede que no exista o ya esté vacía
        console.log(`⚠️ No se pudo listar la carpeta (puede que no exista): ${listError.message}`);
      }
      
      // Ahora eliminar la carpeta vacía
      try {
        await this.makeRequest('/files/delete_v2', {
          method: 'POST',
          body: JSON.stringify({
            path: userFolder
          })
        });
        console.log(`✅ Carpeta eliminada exitosamente: ${userFolder}`);
        return true;
      } catch (folderError: any) {
        // Si la carpeta no existe, considerarlo como éxito
        if (folderError.message.includes('not_found')) {
          console.log(`✅ Carpeta ya no existe: ${userFolder}`);
          return true;
        }
        throw folderError;
      }
      
    } catch (error: any) {
      console.error(`❌ Error eliminando carpeta de Dropbox:`, error.message);
      throw new Error(`Error eliminando carpeta de Dropbox: ${error.message}`);
    }
  }

  /**
   * Verifica si una carpeta de usuario existe en Dropbox
   * @param userEmail - Email del usuario
   * @returns Promise<boolean> - true si la carpeta existe
   */
  static async userFolderExists(userEmail: string): Promise<boolean> {
    try {
      const userFolder = `/GuardaPDFDropbox/${userEmail.replace('@', '_at_').replace('.', '_')}`;
      
      await this.makeRequest('/files/get_metadata', {
        method: 'POST',
        body: JSON.stringify({
          path: userFolder
        })
      });
      
      return true;
    } catch (error: any) {
      if (error.message.includes('not_found')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Obtiene información sobre una carpeta de usuario (archivos, tamaño, etc.)
   * @param userEmail - Email del usuario
   * @returns Promise<object> - Información de la carpeta
   */
  static async getUserFolderInfo(userEmail: string): Promise<{
    exists: boolean;
    fileCount: number;
    totalSize: number;
    files: any[];
  }> {
    try {
      const userFolder = `/GuardaPDFDropbox/${userEmail.replace('@', '_at_').replace('.', '_')}`;
      
      const response = await this.makeRequest('/files/list_folder', {
        method: 'POST',
        body: JSON.stringify({
          path: userFolder,
          recursive: true
        })
      });

      const result = await response.json();
      const files = result.entries.filter((entry: any) => entry['.tag'] === 'file');
      const totalSize = files.reduce((sum: number, file: any) => sum + (file.size || 0), 0);
      
      return {
        exists: true,
        fileCount: files.length,
        totalSize,
        files: files.map((file: any) => ({
          name: file.name,
          size: file.size,
          path: file.path_lower,
          modified: file.server_modified
        }))
      };
    } catch (error: any) {
      if (error.message.includes('not_found')) {
        return {
          exists: false,
          fileCount: 0,
          totalSize: 0,
          files: []
        };
      }
      throw error;
    }
  }
}
