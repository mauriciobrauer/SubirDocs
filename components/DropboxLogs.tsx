'use client';

import { useState, useEffect } from 'react';
import { Cloud, AlertCircle, CheckCircle, RefreshCw, Clock } from 'lucide-react';

interface DropboxLog {
  timestamp: string;
  message: string;
  error?: {
    message: string;
    stack: string;
    type: string;
  };
  phoneNumber?: string;
  fileName?: string;
}

export default function DropboxLogs() {
  const [logs, setLogs] = useState<DropboxLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dropbox-logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching Dropbox logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testDropboxToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-dropbox-token');
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Token válido!\n\nCuenta: ${data.accountInfo.name}\nEmail: ${data.accountInfo.email}\nTipo: ${data.tokenInfo.isLongLived ? 'Larga duración (sl.B.)' : 'Corta duración (sl.u.)'}`);
      } else {
        alert(`❌ Token inválido!\n\nError: ${data.error}\n\nRecomendación: ${data.recommendation}`);
      }
    } catch (err) {
      alert(`❌ Error probando token: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 3000); // Actualizar cada 3 segundos
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getLogIcon = (log: DropboxLog) => {
    if (log.error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getLogColor = (log: DropboxLog) => {
    if (log.error) {
      return 'bg-red-50 border-red-200';
    }
    return 'bg-green-50 border-green-200';
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <Cloud className="h-4 w-4" />
        <span>Logs de Dropbox ({logs.length})</span>
        {isLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
      </button>

      {isVisible && (
        <div className="mt-3 bg-white rounded-lg border border-gray-200 p-4 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Logs de Dropbox</h3>
            <div className="flex gap-2">
              <button
                onClick={testDropboxToken}
                disabled={isLoading}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Probando...' : 'Probar Token'}
              </button>
              <button
                onClick={fetchLogs}
                disabled={isLoading}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {isLoading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Cloud className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No hay logs de Dropbox aún</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.slice(-10).reverse().map((log, index) => (
                <div key={index} className={`rounded border p-3 ${getLogColor(log)}`}>
                  <div className="flex items-start gap-2">
                    {getLogIcon(log)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {log.message}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                      
                      {log.phoneNumber && (
                        <p className="text-xs text-gray-600">
                          📱 {log.phoneNumber}
                        </p>
                      )}
                      
                      {log.fileName && (
                        <p className="text-xs text-gray-600">
                          📄 {log.fileName}
                        </p>
                      )}
                      
                      {log.error && (
                        <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                          <p className="font-medium text-red-800">Error:</p>
                          <p className="text-red-700">{log.error.message}</p>
                          <p className="text-red-600 mt-1">Tipo: {log.error.type}</p>
                          {log.error.stack && (
                            <details className="mt-1">
                              <summary className="cursor-pointer text-red-600">Ver stack trace</summary>
                              <pre className="mt-1 text-xs text-red-600 whitespace-pre-wrap">
                                {log.error.stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
