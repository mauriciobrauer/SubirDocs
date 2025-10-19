'use client';

export default function SimpleDebug() {
  return (
    <div className="bg-red-500 text-white p-8 m-4 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">🔍 SIMPLE DEBUG - ESTE COMPONENTE DEBERÍA SER VISIBLE</h1>
      <p>Si ves esto, el componente se está renderizando correctamente.</p>
      <p>Hora: {new Date().toLocaleString()}</p>
      <p>✅ DEPLOY FUNCIONANDO - Los cambios se están desplegando correctamente</p>
    </div>
  );
}
