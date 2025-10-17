import Link from 'next/link';
import { FileX, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100">
            <FileX className="h-6 w-6 text-gray-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Página no encontrada
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Home className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        <div className="mt-6">
          <p className="text-xs text-gray-500">
            Error 404 - Página no encontrada
          </p>
        </div>
      </div>
    </div>
  );
}
