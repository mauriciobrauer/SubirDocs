'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Download, ExternalLink, RefreshCw, Calendar, HardDrive } from 'lucide-react';

interface FileWithShareLink {
  name: string;
  path_lower: string;
  size: number;
  client_modified: string;
  server_modified: string;
  shareUrl: string | null;
}

interface FileListProps {
  refreshTrigger?: number;
  userEmail: string;
}

export default function FileList({ refreshTrigger, userEmail }: FileListProps) {
  const [files, setFiles] = useState<FileWithShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/files?userEmail=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        if (response.status === 500) {
          // Error de Dropbox (token no configurado)
          setFiles([]);
          setError('');
          return;
        }
        throw new Error('Error al cargar los archivos');
      }
      
      const filesData = await response.json();
      setFiles(filesData);
    } catch (error) {
      // Si es un error de Dropbox, no mostrar error
      if (error instanceof Error && error.message.includes('Dropbox')) {
        setFiles([]);
        setError('');
      } else {
        setError(error instanceof Error ? error.message : 'Error al cargar los archivos');
      }
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    if (refreshTrigger) {
      fetchFiles();
    }
  }, [refreshTrigger, fetchFiles]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (fileName: string) => {
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
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías agregar una notificación de éxito
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Cargando archivos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Archivos subidos</h2>
          <button
            onClick={fetchFiles}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </button>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
          <div className="text-red-600 mb-4">
            <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2" />
            <p className="text-base sm:text-lg font-medium">Error al cargar archivos</p>
            <p className="text-xs sm:text-sm text-red-500 mt-2 px-2">{error}</p>
          </div>
          <button
            onClick={fetchFiles}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Archivos subidos</h2>
          <button
            onClick={fetchFiles}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </button>
        </div>
        
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg px-4">
          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay archivos</h3>
          <p className="text-sm sm:text-base text-gray-600">Sube tu primer documento para comenzar</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 px-2">
            Los archivos se guardarán en Dropbox cuando configures el token de acceso
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Archivos subidos</h2>
        <button
          onClick={fetchFiles}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </button>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {files.map((file) => (
          <div
            key={file.path_lower}
            className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="text-xl sm:text-2xl flex-shrink-0">{getFileIcon(file.name)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </h3>
                  <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs text-gray-500">
                    <div className="flex items-center">
                      <HardDrive className="h-3 w-3 mr-1 flex-shrink-0" />
                      {formatFileSize(file.size)}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                      {formatDate(file.client_modified)}
                    </div>
                  </div>
                </div>
              </div>
              
              {file.shareUrl && (
                <div className="flex items-center space-x-2 sm:ml-4 flex-shrink-0">
                  <button
                    onClick={() => copyToClipboard(file.shareUrl!)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    title="Copiar enlace compartido"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Copiar enlace</span>
                    <span className="sm:hidden">Copiar</span>
                  </button>
                  <a
                    href={file.shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Ver
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
