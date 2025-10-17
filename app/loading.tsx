export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <h2 className="mt-6 text-lg font-medium text-gray-900">
          Cargando...
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Por favor espera mientras cargamos tu contenido
        </p>
      </div>
    </div>
  );
}
