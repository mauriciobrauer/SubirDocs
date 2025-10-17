'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, HardDrive, Phone, ExternalLink, Cloud } from 'lucide-react';

interface DropboxFile {
  phoneNumber: string;
  fileName: string;
  filePath: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
  extension: string;
  dropboxUrl: string | null;
}

export default function DropboxFiles() {
  const [files, setFiles] = useState<DropboxFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFiles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/dropbox-files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        const errorData = await response.json();
        if (response.status === 400) {
          setError('Token de Dropbox no configurado');
        } else {
          setError(errorData.error || 'Error al cargar archivos de Dropbox');
        }
      }
    } catch (error) {
      console.error('Error fetching dropbox files:', error);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // Actualizar cada 30 segundos (menos frecuente que archivos locales)
    const interval = setInterval(fetchFiles, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Cloud className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Archivos en Dropbox</h3>
        </div>
        <button
          onClick={fetchFiles}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-700 text-sm font-medium">
            ℹ️ {error}
          </p>
          <p className="text-blue-600 text-xs mt-1">
            Los archivos se están guardando localmente en <code className="bg-blue-100 px-1 rounded">tmp-files/</code>
          </p>
          <p className="text-blue-600 text-xs mt-1">
            Para subir a Dropbox, obtén un token de acceso en <a href="https://dropbox.com/developers/apps" target="_blank" rel="noopener noreferrer" className="underline">Dropbox Developers</a>
          </p>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {files.length === 0 && !error ? (
          <div className="text-center py-8 text-gray-500">
            <Cloud className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay archivos en Dropbox aún</p>
            <p className="text-sm">Los archivos enviados por WhatsApp aparecerán aquí</p>
          </div>
        ) : (
          files.map((file, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-800">
                    {file.phoneNumber}
                  </span>
                </div>
                <div className="flex gap-1">
                  {file.dropboxUrl && (
                    <a
                      href={file.dropboxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-green-600 hover:text-green-800"
                      title="Ver en Dropbox"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => file.dropboxUrl && window.open(file.dropboxUrl)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Descargar archivo"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">{file.fileName}</span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {formatFileSize(file.size)}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(file.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Archivos guardados en: <code className="bg-gray-100 px-1 rounded">Dropbox/whatsapp_files/</code>
      </div>
    </div>
  );
}
