'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Bug, FileText, Clock } from 'lucide-react';

interface DebugLogsProps {
  isVisible?: boolean;
}

export default function DebugLogs({ isVisible = true }: DebugLogsProps) {
  const [logs, setLogs] = useState<{
    debugLogs: string[];
    mainLogs: string[];
    timestamp: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/debug-logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        setError('Error al cargar logs');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchLogs();
      // Actualizar cada 5 segundos
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Bug className="w-6 h-6 text-red-600" />
        <h2 className="text-xl font-semibold text-gray-800">Debug Logs</h2>
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="ml-auto inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm font-medium">❌ {error}</p>
        </div>
      )}

      {logs && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Última actualización: {new Date(logs.timestamp).toLocaleString('es-ES')}</span>
          </div>

          {/* Logs Detallados */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-800">Logs Detallados (Últimas 50 líneas)</h3>
            </div>
            <div className="bg-black text-green-400 p-3 rounded font-mono text-xs overflow-auto max-h-64">
              {logs.debugLogs.length > 0 ? (
                logs.debugLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No hay logs detallados disponibles</div>
              )}
            </div>
          </div>

          {/* Logs Principales */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-gray-800">Logs Principales (Últimas 20 líneas)</h3>
            </div>
            <div className="bg-black text-yellow-400 p-3 rounded font-mono text-xs overflow-auto max-h-32">
              {logs.mainLogs.length > 0 ? (
                logs.mainLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No hay logs principales disponibles</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
