'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, UserPlus, Save, Cloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ProcessingStatus {
  isProcessing: boolean;
  phoneNumber: string;
  fileName: string;
  messageSid: string;
  status: string;
  timestamp: number;
  error?: string;
}

export default function ProcessingStatus() {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/processing-status');
      if (response.ok) {
        const data = await response.json();
        const currentStatus = data.status;
        
        if (currentStatus.isProcessing) {
          setStatus(currentStatus);
          setIsVisible(true);
        } else if (currentStatus.status === 'completed' && isVisible) {
          // Mostrar completado por 3 segundos y luego ocultar
          setStatus(currentStatus);
          setTimeout(() => {
            setIsVisible(false);
            setStatus(null);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error fetching processing status:', error);
    }
  }, [isVisible]);


  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000); // Verificar cada segundo
    return () => clearInterval(interval);
  }, [isVisible, fetchStatus]);


  const getStatusIcon = () => {
    if (!status) return null;
    
    switch (status.status) {
      case 'received':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'creating_user':
        return <UserPlus className="h-5 w-5 text-yellow-500" />;
      case 'saving_file':
        return <Save className="h-5 w-5 text-orange-500" />;
      case 'uploading_dropbox':
        return <Cloud className="h-5 w-5 text-purple-500" />;
      case 'completed':
        return status.error ? 
          <AlertCircle className="h-5 w-5 text-orange-500" /> : 
          <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    if (!status) return '';
    
    switch (status.status) {
      case 'received':
        return `📄 PDF recibido de ${status.phoneNumber}`;
      case 'creating_user':
        return `👤 Creando usuario para ${status.phoneNumber}...`;
      case 'saving_file':
        return `💾 Guardando archivo ${status.fileName}...`;
      case 'uploading_dropbox':
        return `☁️ Subiendo a Dropbox...`;
      case 'completed':
        return status.error ? 
          `⚠️ ${status.error}` : 
          `✅ Procesamiento completado para ${status.phoneNumber}`;
      default:
        return '🔄 Procesando...';
    }
  };

  const getStatusColor = () => {
    if (!status) return 'bg-gray-100';
    
    switch (status.status) {
      case 'received':
        return 'bg-blue-50 border-blue-200';
      case 'creating_user':
        return 'bg-yellow-50 border-yellow-200';
      case 'saving_file':
        return 'bg-orange-50 border-orange-200';
      case 'uploading_dropbox':
        return 'bg-purple-50 border-purple-200';
      case 'completed':
        return status.error ? 
          'bg-orange-50 border-orange-200' : 
          'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!isVisible || !status) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`rounded-lg border p-4 shadow-lg ${getStatusColor()}`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {getStatusMessage()}
            </p>
            {status.fileName && (
              <p className="text-xs text-gray-500 mt-1">
                Archivo: {status.fileName}
              </p>
            )}
            {status.error && (
              <p className="text-xs text-orange-600 mt-1">
                {status.error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
