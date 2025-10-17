'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { DropboxService } from '@/lib/dropbox';

interface FileUploadProps {
  onUploadSuccess: (file: any) => void;
  userEmail: string;
}

export default function FileUpload({ onUploadSuccess, userEmail }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('error');
      setErrorMessage('Solo se permiten archivos PDF y DOC');
      return;
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadStatus('error');
      setErrorMessage('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userEmail', userEmail);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir el archivo');
      }

      const uploadedFile = await response.json();
      setUploadStatus('success');
      onUploadSuccess(uploadedFile);
      
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : uploadStatus === 'success'
            ? 'border-green-400 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg font-medium text-gray-700">Subiendo archivo...</p>
            <p className="text-xs sm:text-sm text-gray-500">Por favor espera</p>
          </div>
        ) : uploadStatus === 'success' ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg font-medium text-green-700">¡Archivo subido exitosamente!</p>
            <p className="text-xs sm:text-sm text-green-600">El archivo se ha guardado en Dropbox</p>
          </div>
        ) : uploadStatus === 'error' ? (
          <div className="flex flex-col items-center">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg font-medium text-red-700">Error al subir archivo</p>
            <p className="text-xs sm:text-sm text-red-600 px-2">{errorMessage}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg font-medium text-gray-700 mb-2 px-2">
              Arrastra y suelta tu archivo aquí
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 px-2">
              o haz clic para seleccionar un archivo
            </p>
            <button
              type="button"
              onClick={openFileDialog}
              className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Seleccionar archivo
            </button>
          </div>
        )}

        <div className="mt-3 sm:mt-4 text-xs text-gray-500 px-2">
          <p>Formatos soportados: PDF, DOC, DOCX</p>
          <p>Tamaño máximo: 10MB</p>
        </div>
      </div>
    </div>
  );
}
