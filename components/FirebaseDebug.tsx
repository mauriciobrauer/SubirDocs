'use client';

import { useState } from 'react';

export default function FirebaseDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      // Usar el endpoint /api/users que ya tiene los logs de Firebase
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.debugLogs && data.debugLogs.length > 0) {
        setLogs(data.debugLogs);
        setShowLogs(true);
      } else if (data.success) {
        setLogs([
          '✅ Firebase está funcionando correctamente',
          `📊 Usuarios encontrados: ${data.count}`,
          `📂 Fuente: ${data.source}`,
          `🔧 Firebase funcionando: ${data.firebaseWorking ? 'Sí' : 'No'}`,
          `🔑 Service Account Key presente: ${data.hasServiceAccountKey ? 'Sí' : 'No'}`,
          `📏 Longitud de Service Account Key: ${data.serviceAccountKeyLength || 0}`
        ]);
        setShowLogs(true);
      } else {
        setLogs([`❌ Error: ${data.error}`, `📋 Detalles: ${data.firebaseError || 'No disponible'}`]);
        setShowLogs(true);
      }
    } catch (error) {
      setLogs([`❌ Error de red: ${error}`]);
      setShowLogs(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Firebase Debug</h2>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
        </button>
      </div>
      
      {showLogs && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
          <div className="mb-2 text-yellow-400">
            🔥 Firebase Debug Logs - {new Date().toLocaleString()}
          </div>
          {logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Este diagnóstico ejecutará varias pruebas de Firebase y mostrará los logs detallados para identificar el problema.</p>
      </div>
    </div>
  );
}
