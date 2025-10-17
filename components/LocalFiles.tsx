'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, HardDrive, Phone } from 'lucide-react';

interface LocalFile {
  phoneNumber: string;
  fileName: string;
  filePath: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
  extension: string;
}

export default function LocalFiles() {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/local-files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching local files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // Actualizar cada 10 segundos
    const interval = setInterval(fetchFiles, 10000);
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

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const response = await fetch(filePath);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold">Archivos Descargados</h3>
        </div>
        <button
          onClick={fetchFiles}
          disabled={isLoading}
          className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay archivos descargados aún</p>
            <p className="text-sm">Envía un archivo desde WhatsApp para verlo aquí</p>
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
                <button
                  onClick={() => downloadFile(file.filePath, file.fileName)}
                  className="p-1 text-blue-600 hover:text-blue-800"
                  title="Descargar archivo"
                >
                  <Download className="w-4 h-4" />
                </button>
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
        Archivos guardados en: <code className="bg-gray-100 px-1 rounded">tmp-files/</code>
      </div>
    </div>
  );
}
