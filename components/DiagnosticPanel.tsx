'use client';

import { useState, useEffect } from 'react';

export default function DiagnosticPanel() {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Logs iniciales
    const initialLogs = [
      '🔍 === DIAGNÓSTICO DE COMPONENTE ===',
      '✅ Componente DiagnosticPanel cargado correctamente',
      `📅 Hora: ${new Date().toLocaleString()}`,
      `🌐 Navegador: ${typeof window !== 'undefined' ? 'Disponible' : 'No disponible'}`,
      `🔧 React: ${typeof React !== 'undefined' ? 'Disponible' : 'No disponible'}`,
    ];
    setDiagnostics(initialLogs);
  }, []);

  const testAPI = async () => {
    setLoading(true);
    const newLogs = [...diagnostics];
    newLogs.push('🔄 === PROBANDO API ===');
    
    try {
      newLogs.push('📡 Llamando a /api/users...');
      const response = await fetch('/api/users');
      newLogs.push(`📊 Status: ${response.status}`);
      
      const data = await response.json();
      newLogs.push(`📋 Datos recibidos: ${JSON.stringify(data).substring(0, 200)}...`);
      
      if (data.debugLogs) {
        newLogs.push('✅ Logs de debug encontrados');
        data.debugLogs.forEach((log: string) => {
          newLogs.push(`🔥 ${log}`);
        });
      } else {
        newLogs.push('❌ No se encontraron logs de debug');
      }
      
    } catch (error) {
      newLogs.push(`❌ Error: ${error}`);
    }
    
    setDiagnostics(newLogs);
    setLoading(false);
  };

  const testFirebase = async () => {
    setLoading(true);
    const newLogs = [...diagnostics];
    newLogs.push('🔥 === PROBANDO FIREBASE ===');
    
    try {
      newLogs.push('📡 Llamando a /api/users...');
      const response = await fetch('/api/users');
      const data = await response.json();
      
      newLogs.push(`📊 Usuarios encontrados: ${data.count}`);
      newLogs.push(`📂 Fuente: ${data.source}`);
      newLogs.push(`🔧 Firebase funcionando: ${data.firebaseWorking ? 'Sí' : 'No'}`);
      newLogs.push(`🔑 Service Account Key presente: ${data.hasServiceAccountKey ? 'Sí' : 'No'}`);
      
      if (data.firebaseError) {
        newLogs.push(`❌ Error de Firebase: ${data.firebaseError}`);
      }
      
    } catch (error) {
      newLogs.push(`❌ Error: ${error}`);
    }
    
    setDiagnostics(newLogs);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-red-500">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        🔍 Panel de Diagnóstico
      </h2>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={testAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Probando...' : 'Probar API'}
        </button>
        
        <button
          onClick={testFirebase}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Probando...' : 'Probar Firebase'}
        </button>
      </div>
      
      <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
        {diagnostics.map((log, index) => (
          <div key={index} className="mb-1">
            {log}
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Este panel te mostrará exactamente qué está pasando con Firebase y por qué no se está mostrando el componente.</p>
      </div>
    </div>
  );
}
