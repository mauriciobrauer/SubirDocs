import { UploadedFile, DropboxFile } from '@/types';
import TokenManager from './token-manager';

export class DropboxAPI {
  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `https://api.dropboxapi.com/2${endpoint}`;
    
    // Obtener access token válido (se renueva automáticamente si es necesario)
    const accessToken = await TokenManager.getValidAccessToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
    const accessToken = await TokenManager.getValidAccessToken();
    const uploadResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
    
    // Intentar buscar en la carpeta transformada primero
    let response = await this.makeRequest('/files/list_folder', {
      method: 'POST',
      body: JSON.stringify({
        path: userFolder,
        recursive: false
      })
    });

    let result = await response.json();
    
    // Si no hay archivos en la carpeta transformada, intentar en la carpeta original
    if (result.entries.filter((entry: any) => entry['.tag'] === 'file').length === 0) {
      // Extraer solo el número de teléfono si es un email de WhatsApp
      const phoneNumber = userEmail.includes('@whatsapp.local') 
        ? userEmail.split('@')[0] 
        : userEmail;
      
      const originalFolder = `/GuardaPDFDropbox/${phoneNumber}`;
      
      try {
        response = await this.makeRequest('/files/list_folder', {
          method: 'POST',
          body: JSON.stringify({
            path: originalFolder,
            recursive: false
          })
        });
        result = await response.json();
      } catch (error) {
        // Si no existe la carpeta original, usar el resultado vacío de la carpeta transformada
        console.log(`Carpeta original ${originalFolder} no existe, usando resultado vacío`);
      }
    }
    
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

  static async getAllFiles(): Promise<DropboxFile[]> {
    // Asegurar que la carpeta principal existe
    await this.createFolder('/GuardaPDFDropbox');
    
    const response = await this.makeRequest('/files/list_folder', {
      method: 'POST',
      body: JSON.stringify({
        path: '/GuardaPDFDropbox',
        recursive: true
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
      // Usar el mismo formato que DropboxAPI.uploadFile para consistencia
      // Transformar el email como lo hace uploadFile: @ -> _at_, . -> _
      const userFolder = `/GuardaPDFDropbox/${userEmail.replace('@', '_at_').replace('.', '_')}`;
      
      console.log(`🗑️ === INICIANDO ELIMINACIÓN DE CARPETA DROPBOX ===`);
      console.log(`📧 Email del usuario: ${userEmail}`);
      console.log(`📁 Ruta de carpeta: ${userFolder}`);
      const accessToken = await TokenManager.getValidAccessToken();
      console.log(`🔑 Token disponible: ${!!accessToken}`);
      console.log(`🔑 Token inicio: ${accessToken ? accessToken.substring(0, 20) + '...' : 'NO TOKEN'}`);
      
      // Primero, listar todos los archivos en la carpeta para eliminarlos
      console.log(`📋 PASO 1: Listando archivos en la carpeta...`);
      try {
        const listResponse = await this.makeRequest('/files/list_folder', {
          method: 'POST',
          body: JSON.stringify({
            path: userFolder,
            recursive: true
          })
        });

        console.log(`📋 Respuesta de listado: ${listResponse.status} ${listResponse.statusText}`);
        const listResult = await listResponse.json();
        console.log(`📋 Resultado del listado:`, JSON.stringify(listResult, null, 2));
        
        const files = listResult.entries.filter((entry: any) => entry['.tag'] === 'file');
        
        console.log(`📋 Encontrados ${files.length} archivos para eliminar`);
        files.forEach((file: any, index: number) => {
          console.log(`📄 Archivo ${index + 1}: ${file.name} (${file.path_lower})`);
        });
        
        // Eliminar cada archivo individualmente
        console.log(`🗑️ PASO 2: Eliminando archivos individualmente...`);
        for (const file of files) {
          try {
            console.log(`🗑️ Eliminando archivo: ${file.name} (${file.path_lower})`);
            const deleteResponse = await this.makeRequest('/files/delete_v2', {
              method: 'POST',
              body: JSON.stringify({
                path: file.path_lower
              })
            });
            console.log(`✅ Archivo eliminado exitosamente: ${file.name}`);
          } catch (fileError: any) {
            console.error(`❌ Error eliminando archivo ${file.name}:`, fileError.message);
            console.error(`❌ Detalles del error:`, JSON.stringify(fileError, null, 2));
            // Continuar con los demás archivos
          }
        }
      } catch (listError: any) {
        // Si no se puede listar la carpeta, puede que no exista o ya esté vacía
        console.log(`⚠️ No se pudo listar la carpeta (puede que no exista): ${listError.message}`);
      }
      
      // Ahora eliminar la carpeta vacía
      console.log(`🗑️ PASO 3: Eliminando carpeta vacía...`);
      try {
        console.log(`🗑️ Eliminando carpeta: ${userFolder}`);
        const folderDeleteResponse = await this.makeRequest('/files/delete_v2', {
          method: 'POST',
          body: JSON.stringify({
            path: userFolder
          })
        });
        console.log(`✅ Respuesta de eliminación de carpeta: ${folderDeleteResponse.status} ${folderDeleteResponse.statusText}`);
        console.log(`✅ Carpeta eliminada exitosamente: ${userFolder}`);
        return true;
      } catch (folderError: any) {
        console.error(`❌ Error eliminando carpeta:`, folderError.message);
        console.error(`❌ Detalles del error:`, JSON.stringify(folderError, null, 2));
        
        // Si la carpeta no existe, considerarlo como éxito
        if (folderError.message.includes('not_found')) {
          console.log(`✅ Carpeta ya no existe: ${userFolder}`);
          return true;
        }
        throw folderError;
      }
      
    } catch (error: any) {
      console.error(`❌ === ERROR GENERAL EN ELIMINACIÓN DE CARPETA ===`);
      console.error(`❌ Error:`, error.message);
      console.error(`❌ Stack trace:`, error.stack);
      console.error(`❌ Error completo:`, JSON.stringify(error, null, 2));
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
