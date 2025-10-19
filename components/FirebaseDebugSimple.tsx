'use client';

import { useState } from 'react';

export default function FirebaseDebugSimple() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testFirebase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Firebase Debug</h2>
      
      <button
        onClick={testFirebase}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 mb-4"
      >
        {loading ? 'Probando...' : 'Probar Firebase'}
      </button>
      
      {result && (
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-semibold mb-2">Resultado:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
